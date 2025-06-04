import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { schemas } from "@/generated/api";
import { useApiQuery } from "@/hooks/use-api-query";

import { API_BASE_URL, apiClient } from "./client";
import { type FetchTracksOptions, type Track, type TrackId } from "./types";

export const baseTrackSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  album: z.string().optional(),
  genres: z.array(z.string()).min(1, "At least one genre is required"),
  coverImage: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});
export type BaseTrackFormData = z.infer<typeof baseTrackSchema>;

export const createTrackSchema = schemas.postApitracks_Body.extend(
  baseTrackSchema.shape
);
export type CreateTrackFormData = z.infer<typeof createTrackSchema>;

export const editTrackSchema = schemas.putApitracksId_Body.extend(
  baseTrackSchema.shape
);
export type EditTrackFormData = z.infer<typeof editTrackSchema>;

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

export const useGetTracks = (options: FetchTracksOptions) => {
  return useApiQuery({
    queryKey: trackQueryKeys.list(options),
    queryFn: () => tracksApi.getTracks(options),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTrackFormData) => tracksApi.createTrack(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trackQueryKeys.all() });
    },
  });
};

export const useUpdateTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: TrackId; data: EditTrackFormData }) =>
      tracksApi.updateTrack(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trackQueryKeys.all() });
    },
  });
};

export const useDeleteTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: TrackId) => tracksApi.deleteTrack(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trackQueryKeys.all() });
    },
  });
};

export const useDeleteTracks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: TrackId[]) => tracksApi.deleteTracks(ids),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trackQueryKeys.all() });
    },
  });
};

export const useUploadTrackFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ trackId, file }: { trackId: TrackId; file: File }) =>
      tracksApi.uploadTrackFile(trackId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trackQueryKeys.all() });
    },
  });
};

export const useDeleteTrackFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: TrackId) => tracksApi.deleteTrackFile(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trackQueryKeys.all() });
    },
  });
};

export const getTrackAudioUrl = (
  audioFile: NonNullable<Track["audioFile"]>
): string => {
  return `${API_BASE_URL}/api/files/${audioFile}`;
};
