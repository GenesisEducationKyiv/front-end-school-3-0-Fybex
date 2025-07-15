import { createConnectQueryKey } from "@connectrpc/connect-query";
import {
  createTrack,
  deleteFile,
  deleteTrack,
  deleteTracks,
  getTrackBySlug,
  getTracks,
  updateTrack,
  uploadFile,
} from "@music-app/proto";
import type { GetTracksRequest } from "@music-app/proto/tracks";
import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";

export function getTrackAudioUrl(audioFile: string): string {
  if (audioFile.startsWith("/")) {
    return audioFile;
  }
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  return `${baseUrl}/api/tracks/audio/${audioFile}`;
}

export const trackQueryKeys = {
  all: () =>
    createConnectQueryKey({ schema: getTracks, cardinality: "finite" }),
  list: (options: GetTracksRequest) =>
    createConnectQueryKey({
      schema: getTracks,
      input: options,
      cardinality: "finite",
    }),
  bySlug: (slug: string) =>
    createConnectQueryKey({
      schema: getTrackBySlug,
      input: { slug },
      cardinality: "finite",
    }),
};

export const useGetTracks = (options: GetTracksRequest) => {
  return useApiQuery(getTracks, options, {
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetTrackBySlug = (slug: string) => {
  return useApiQuery(
    getTrackBySlug,
    { slug },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
};

export const useCreateTrack = () => {
  const queryClient = useQueryClient();

  return useApiMutation(createTrack, {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trackQueryKeys.all() });
    },
  });
};

export const useUpdateTrack = () => {
  const queryClient = useQueryClient();

  return useApiMutation(updateTrack, {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trackQueryKeys.all() });
    },
  });
};

export const useDeleteTrack = () => {
  const queryClient = useQueryClient();

  return useApiMutation(deleteTrack, {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trackQueryKeys.all() });
    },
  });
};

export const useDeleteTracks = () => {
  const queryClient = useQueryClient();

  return useApiMutation(deleteTracks, {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trackQueryKeys.all() });
    },
  });
};

export const useUploadTrackFile = () => {
  const queryClient = useQueryClient();

  return useApiMutation(uploadFile, {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trackQueryKeys.all() });
    },
  });
};

export const useDeleteTrackFile = () => {
  const queryClient = useQueryClient();

  return useApiMutation(deleteFile, {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trackQueryKeys.all() });
    },
  });
};
