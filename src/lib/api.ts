import { paginatedTracksSchema, PaginatedTracksResponse } from './schemas';
import { trackSchema, Track } from './schemas';
import { CreateTrackFormData } from './schemas';
import { genresSchema, GenresResponse } from './schemas';
import { EditTrackFormData } from './schemas';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface FetchTracksOptions {
  page?: number;
  limit?: number;
  sort?: 'title' | 'artist' | 'album' | 'createdAt';
  order?: 'asc' | 'desc';
  search?: string;
  genre?: string;
  artist?: string;
}

export async function fetchTracks(
  options: FetchTracksOptions = {},
): Promise<PaginatedTracksResponse> {
  const { page = 1, limit = 10, sort, order, search, genre, artist } = options;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (sort) params.append('sort', sort);
  if (order) params.append('order', order);
  if (search) params.append('search', search);
  if (genre) params.append('genre', genre);
  if (artist) params.append('artist', artist);

  const response = await fetch(`${API_BASE_URL}/tracks?${params.toString()}`);

  if (!response.ok) {
    let errorBody = 'Unknown error';
    try {
      const errJson = await response.json();
      errorBody = errJson.error || JSON.stringify(errJson);
    } catch {
      /* Ignore */
    }
    throw new Error(`Failed to fetch tracks: ${response.status} ${errorBody}`);
  }
  const data = await response.json();
  const validationResult = paginatedTracksSchema.safeParse(data);

  if (!validationResult.success) {
    console.error(
      'API response validation failed:',
      validationResult.error.errors,
    );
    throw new Error('Invalid data received from server.');
  }

  return validationResult.data;
}

export async function fetchGenres(): Promise<GenresResponse> {
  const response = await fetch(`${API_BASE_URL}/genres`);
  if (!response.ok) {
    let errorBody = 'Unknown error';
    try {
      const errJson = await response.json();
      errorBody = errJson.error || JSON.stringify(errJson);
    } catch {
      /* Ignore */
    }
    throw new Error(`Failed to fetch genres: ${response.status} ${errorBody}`);
  }
  const data = await response.json();
  const validationResult = genresSchema.safeParse(data);

  if (!validationResult.success) {
    console.error(
      'Genre API response validation failed:',
      validationResult.error.errors,
    );
    throw new Error('Invalid genre data received from server.');
  }
  return validationResult.data;
}

export async function createTrack(
  trackData: CreateTrackFormData,
): Promise<Track> {
  const response = await fetch(`${API_BASE_URL}/tracks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(trackData),
  });

  if (!response.ok) {
    let errorBody = 'Unknown error';
    try {
      const errJson = await response.json();
      errorBody = errJson.error || JSON.stringify(errJson);
    } catch {
      /* Ignore */
    }
    if (response.status === 409) {
      throw new Error(`Failed to create track: ${errorBody}`);
    }
    throw new Error(`Failed to create track: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  const validationResult = trackSchema.safeParse(data);

  if (!validationResult.success) {
    console.error(
      'Create track response validation failed:',
      validationResult.error.errors,
    );
    throw new Error('Invalid track data received after creation.');
  }

  return validationResult.data;
}

export async function updateTrack(
  id: string,
  trackData: EditTrackFormData,
): Promise<Track> {
  const response = await fetch(`${API_BASE_URL}/tracks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(trackData),
  });

  if (!response.ok) {
    let errorBody = 'Unknown error';
    try {
      const errJson = await response.json();
      errorBody = errJson.error || JSON.stringify(errJson);
    } catch {
      /* Ignore */
    }
    if (response.status === 409) {
      throw new Error(`Failed to update track: ${errorBody}`);
    }
    if (response.status === 404) {
      throw new Error(`Track not found.`);
    }
    throw new Error(`Failed to update track: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  const validationResult = trackSchema.safeParse(data);

  if (!validationResult.success) {
    console.error(
      'Update track response validation failed:',
      validationResult.error.errors,
    );
    throw new Error('Invalid track data received after update.');
  }

  return validationResult.data;
}

export async function deleteTrack(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tracks/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    let errorBody = 'Unknown error';
    try {
      if (response.headers.get('content-type')?.includes('application/json')) {
        const errJson = await response.json();
        errorBody = errJson.error || JSON.stringify(errJson);
      }
    } catch {
      /* Ignore */
    }
    if (response.status === 404) {
      throw new Error(`Track not found.`);
    }
    throw new Error(`Failed to delete track: ${response.status} ${errorBody}`);
  }
}

export async function uploadTrackFile(
  trackId: string,
  file: File,
): Promise<Track> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/tracks/${trackId}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorBody = 'Unknown error';
    try {
      const errJson = await response.json();
      errorBody = errJson.error || JSON.stringify(errJson);
    } catch {
      /* Ignore */
    }
    if (response.status === 404) {
      throw new Error('Track not found.');
    }
    throw new Error(`Failed to upload file: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  const validationResult = trackSchema.safeParse(data);
  if (!validationResult.success) {
    console.error(
      'Upload track file response validation failed:',
      validationResult.error.errors,
    );
    throw new Error('Invalid track data received after file upload.');
  }
  return validationResult.data;
}
