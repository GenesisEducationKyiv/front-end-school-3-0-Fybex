export const queryKeys = {
  tracks: {
    all: ['tracks'] as const,
    list: (filters?: Record<string, string | number | undefined>) =>
      [...queryKeys.tracks.all, 'list', filters ?? {}] as const,
  },
  genres: {
    all: ['genres'] as const,
    list: () => [...queryKeys.genres.all, 'list'] as const,
  },
};
