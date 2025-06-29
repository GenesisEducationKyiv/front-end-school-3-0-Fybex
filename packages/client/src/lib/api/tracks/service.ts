import { API_BASE_URL, apiClient } from "@/lib/api/client";

import {
  type CreateTrackFormData,
  type EditTrackFormData,
  type FetchTracksOptions,
  type Track,
  type TrackId,
} from "./types";

export const trackQueryKeys = {
  all: () => ["tracks"] as const,
  list: (options: FetchTracksOptions) =>
    [...trackQueryKeys.all(), options] as const,
};

export const tracksApi = {
  async getTracks(options: FetchTracksOptions) {
    return apiClient.getApitracks({
      queries: {
        page: options.page,
        limit: options.limit,
        sort: options.sort,
        order: options.order,
        search: options.search,
        genre: options.genre,
        artist: options.artist,
      },
    });
  },

  async getTrackBySlug(slug: NonNullable<Track["slug"]>) {
    return apiClient.getApitracksSlug({ params: { slug } });
  },

  async createTrack(trackData: CreateTrackFormData) {
    return apiClient.postApitracks({
      title: trackData.title,
      artist: trackData.artist,
      album: trackData.album,
      genres: trackData.genres,
      coverImage: trackData.coverImage,
    });
  },

  async updateTrack(id: TrackId, trackData: EditTrackFormData) {
    return apiClient.putApitracksId(
      {
        title: trackData.title,
        artist: trackData.artist,
        album: trackData.album,
        genres: trackData.genres,
        coverImage: trackData.coverImage,
      },
      { params: { id } }
    );
  },

  async deleteTrack(id: TrackId) {
    return apiClient.deleteApitracksId(undefined, { params: { id } });
  },

  async deleteTracks(ids: TrackId[]) {
    return apiClient.postApitracksdelete({ ids });
  },

  async uploadTrackFile(trackId: TrackId, file: File) {
    // * implemented manually
    // * client generator didn't handle multipart/form-data correctly
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${API_BASE_URL}/api/tracks/${trackId}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = (await response
        .json()
        .catch(() => ({ error: "Upload failed" }))) as { error?: string };
      throw new Error(
        errorData.error ?? `HTTP error! status: ${response.status.toString()}`
      );
    }
  },

  async deleteTrackFile(id: TrackId) {
    return apiClient.deleteApitracksIdfile(undefined, { params: { id } });
  },
};

export const getTrackAudioUrl = (
  audioFile: NonNullable<Track["audioFile"]>
): string => {
  return `${API_BASE_URL}/api/files/${audioFile}`;
};
