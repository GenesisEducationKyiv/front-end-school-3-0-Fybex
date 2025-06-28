import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useApiQuery } from "@/hooks/useApiQuery";

import { trackQueryKeys, tracksApi } from "./service";
import {
  type CreateTrackFormData,
  type EditTrackFormData,
  type FetchTracksOptions,
  type TrackId,
} from "./types";

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
