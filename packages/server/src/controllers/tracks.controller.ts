import { create } from '@bufbuild/protobuf';
import { type Timestamp, TimestampSchema } from '@bufbuild/protobuf/wkt';
import { Code, ConnectError } from '@connectrpc/connect';
import {
  type CreateTrackRequest,
  type CreateTrackResponse,
  CreateTrackResponseSchema,
  type DeleteFileRequest,
  type DeleteFileResponse,
  DeleteFileResponseSchema,
  type DeleteTrackRequest,
  type DeleteTrackResponse,
  DeleteTrackResponseSchema,
  type DeleteTracksRequest,
  type DeleteTracksResponse,
  DeleteTracksResponseSchema,
  type GetTrackBySlugRequest,
  type GetTrackBySlugResponse,
  GetTrackBySlugResponseSchema,
  type GetTracksRequest,
  type GetTracksResponse,
  GetTracksResponseSchema,
  PaginationMetaSchema,
  type Track as ProtoTrack,
  TrackSchema as ProtoTrackSchema,
  SortField,
  SortOrder,
  type UpdateTrackRequest,
  type UpdateTrackResponse,
  UpdateTrackResponseSchema,
  type UploadFileRequest,
  type UploadFileResponse,
  UploadFileResponseSchema,
} from '@music-app/proto';

import { type Track as DbTrack } from '../types';
import {
  createTrack,
  deleteAudioFile,
  deleteMultipleTracks,
  deleteTrack,
  getTrackById,
  getTrackBySlug,
  getTracks,
  saveAudioFile,
  updateTrack,
} from '../utils/db';
import { createSlug } from '../utils/slug';

// Helper function to convert Date to Timestamp
function dateToTimestamp(date: Date): Timestamp {
  return create(TimestampSchema, {
    seconds: BigInt(Math.floor(date.getTime() / 1000)),
    nanos: (date.getTime() % 1000) * 1000000,
  });
}

// Helper function to convert database track to protobuf Track
function dbTrackToProto(dbTrack: DbTrack): ProtoTrack {
  return create(ProtoTrackSchema, {
    id: dbTrack.id,
    title: dbTrack.title,
    artist: dbTrack.artist,
    album: dbTrack.album ?? '',
    genres: dbTrack.genres,
    slug: dbTrack.slug,
    coverImage: dbTrack.coverImage ?? '',
    audioFile: dbTrack.audioFile ?? '',
    createdAt: dateToTimestamp(new Date(dbTrack.createdAt)),
    updatedAt: dateToTimestamp(new Date(dbTrack.updatedAt)),
  });
}

function sortFieldToString(
  sortField: SortField | undefined,
): 'title' | 'artist' | 'album' | 'createdAt' | undefined {
  if (sortField === undefined) return undefined;
  switch (sortField) {
    case SortField.TITLE:
      return 'title';
    case SortField.ARTIST:
      return 'artist';
    case SortField.ALBUM:
      return 'album';
    case SortField.CREATED_AT:
      return 'createdAt';
    default:
      return undefined;
  }
}

function sortOrderToString(
  sortOrder: SortOrder | undefined,
): 'asc' | 'desc' | undefined {
  if (sortOrder === undefined) return undefined;
  switch (sortOrder) {
    case SortOrder.ASC:
      return 'asc';
    case SortOrder.DESC:
      return 'desc';
    default:
      return undefined;
  }
}

/**
 * Get all tracks with pagination, sorting, and filtering
 */
export async function getAllTracks(
  request: GetTracksRequest,
): Promise<GetTracksResponse> {
  try {
    const query = {
      page: request.page ?? 1,
      limit: request.limit ?? 10,
      sort: sortFieldToString(request.sort),
      order: sortOrderToString(request.order),
      search: request.search,
      genre: request.genre,
      artist: request.artist,
    };

    const { tracks, total } = await getTracks(query);

    const protoTracks = tracks.map(dbTrackToProto);

    const meta = create(PaginationMetaSchema, {
      total: total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    });

    return create(GetTracksResponseSchema, {
      tracks: protoTracks,
      meta: meta,
    });
  } catch (error) {
    console.error('Error getting tracks:', error);
    throw new ConnectError('Failed to get tracks', Code.Internal);
  }
}

/**
 * Get a track by its slug
 */
export async function getTrack(
  request: GetTrackBySlugRequest,
): Promise<GetTrackBySlugResponse> {
  try {
    const track = await getTrackBySlug(request.slug);

    if (!track) {
      throw new ConnectError('Track not found', Code.NotFound);
    }

    return create(GetTrackBySlugResponseSchema, {
      track: dbTrackToProto(track),
    });
  } catch (error) {
    if (error instanceof ConnectError) {
      throw error;
    }
    console.error('Error getting track:', error);
    throw new ConnectError('Failed to get track', Code.Internal);
  }
}

/**
 * Create a new track
 */
export async function addTrack(
  request: CreateTrackRequest,
): Promise<CreateTrackResponse> {
  try {
    const { title, artist, album = '', genres = [], coverImage = '' } = request;

    if (!title || !artist) {
      throw new ConnectError(
        'Title and artist are required',
        Code.InvalidArgument,
      );
    }

    const slug = createSlug(title);

    const existingTrack = await getTrackBySlug(slug);
    if (existingTrack) {
      throw new ConnectError(
        'A track with this title already exists',
        Code.AlreadyExists,
      );
    }

    const newTrack = await createTrack({
      title,
      artist,
      album,
      genres: genres,
      coverImage,
      slug,
    });

    return create(CreateTrackResponseSchema, {
      track: dbTrackToProto(newTrack),
    });
  } catch (error) {
    if (error instanceof ConnectError) {
      throw error;
    }
    console.error('Error creating track:', error);
    throw new ConnectError('Failed to create track', Code.Internal);
  }
}

/**
 * Update a track by ID
 */
export async function updateTrackById(
  request: UpdateTrackRequest,
): Promise<UpdateTrackResponse> {
  try {
    const { id, title, artist, album, genres, coverImage } = request;

    const existingTrack = await getTrackById(id);
    if (!existingTrack) {
      throw new ConnectError('Track not found', Code.NotFound);
    }

    // Only update fields that are provided (not empty)
    const updates: Partial<DbTrack> = {};

    if (title) updates.title = title;
    if (artist) updates.artist = artist;
    if (album) updates.album = album;
    if (genres.length > 0) updates.genres = genres;
    if (coverImage) updates.coverImage = coverImage;

    if (title && title !== existingTrack.title) {
      const newSlug = createSlug(title);

      // Check if the new slug already exists on a different track
      const trackWithSameSlug = await getTrackBySlug(newSlug);
      if (trackWithSameSlug && trackWithSameSlug.id !== id) {
        throw new ConnectError(
          'A track with this title already exists',
          Code.AlreadyExists,
        );
      }

      updates.slug = newSlug;
    }

    const updatedTrack = await updateTrack(id, updates);

    if (!updatedTrack) {
      throw new ConnectError(
        'Failed to update track, track not found after update.',
        Code.Internal,
      );
    }

    return create(UpdateTrackResponseSchema, {
      track: dbTrackToProto(updatedTrack),
    });
  } catch (error) {
    if (error instanceof ConnectError) {
      throw error;
    }
    console.error('Error updating track:', error);
    throw new ConnectError('Failed to update track', Code.Internal);
  }
}

/**
 * Delete a track by ID
 */
export async function removeTrack(
  request: DeleteTrackRequest,
): Promise<DeleteTrackResponse> {
  try {
    const success = await deleteTrack(request.id);

    if (!success) {
      throw new ConnectError('Track not found', Code.NotFound);
    }

    return create(DeleteTrackResponseSchema, {
      success: true,
    });
  } catch (error) {
    if (error instanceof ConnectError) {
      throw error;
    }
    console.error('Error deleting track:', error);
    throw new ConnectError('Failed to delete track', Code.Internal);
  }
}

/**
 * Delete multiple tracks
 */
export async function removeTracks(
  request: DeleteTracksRequest,
): Promise<DeleteTracksResponse> {
  try {
    const { ids } = request;

    if (ids.length === 0) {
      throw new ConnectError('Track IDs are required', Code.InvalidArgument);
    }

    const results = await deleteMultipleTracks(ids);

    return create(DeleteTracksResponseSchema, {
      success: results.success,
      failed: results.failed,
    });
  } catch (error) {
    if (error instanceof ConnectError) {
      throw error;
    }
    console.error('Error deleting tracks:', error);
    throw new ConnectError('Failed to delete tracks', Code.Internal);
  }
}

/**
 * Upload a file for a track
 */
export async function uploadTrackFile(
  request: UploadFileRequest,
): Promise<UploadFileResponse> {
  try {
    const { trackId, filename, content, contentType } = request;

    if (!trackId || !filename) {
      throw new ConnectError(
        'Track ID, filename, and content are required',
        Code.InvalidArgument,
      );
    }

    // Validate file type
    const allowedTypes = [
      'audio/mpeg',
      'audio/wav',
      'audio/mp3',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];
    if (!allowedTypes.includes(contentType)) {
      throw new ConnectError('Invalid file type', Code.InvalidArgument);
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (content.length > maxSize) {
      throw new ConnectError('File size exceeds limit', Code.InvalidArgument);
    }

    const track = await getTrackById(trackId);
    if (!track) {
      throw new ConnectError('Track not found', Code.NotFound);
    }

    await saveAudioFile(trackId, filename, Buffer.from(content));

    // Get updated track
    const updatedTrack = await getTrackById(trackId);

    if (!updatedTrack) {
      throw new ConnectError(
        'Failed to get updated track after file upload.',
        Code.Internal,
      );
    }

    return create(UploadFileResponseSchema, {
      track: dbTrackToProto(updatedTrack),
    });
  } catch (error) {
    if (error instanceof ConnectError) {
      throw error;
    }
    console.error('Error uploading file:', error);
    throw new ConnectError('Failed to upload file', Code.Internal);
  }
}

/**
 * Delete a file for a track
 */
export async function deleteTrackFile(
  request: DeleteFileRequest,
): Promise<DeleteFileResponse> {
  try {
    const { trackId } = request;

    if (!trackId) {
      throw new ConnectError('Track ID is required', Code.InvalidArgument);
    }

    const track = await getTrackById(trackId);
    if (!track) {
      throw new ConnectError('Track not found', Code.NotFound);
    }

    await deleteAudioFile(trackId);

    // Get updated track
    const updatedTrack = await getTrackById(trackId);

    if (!updatedTrack) {
      throw new ConnectError(
        'Failed to get updated track after file deletion.',
        Code.Internal,
      );
    }

    return create(DeleteFileResponseSchema, {
      track: dbTrackToProto(updatedTrack),
    });
  } catch (error) {
    if (error instanceof ConnectError) {
      throw error;
    }
    console.error('Error deleting file:', error);
    throw new ConnectError('Failed to delete file', Code.Internal);
  }
}
