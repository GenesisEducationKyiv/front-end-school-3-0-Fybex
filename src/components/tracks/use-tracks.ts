import { useApiQuery } from '@/hooks/use-api-query';
import { fetchTracks, FetchTracksOptions } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { PaginatedTracksResponse } from '@/lib/schemas';

export function useTracks(options: FetchTracksOptions = {}) {
  const definedOptions = Object.entries(options).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = typeof value === 'number' ? value : String(value);
    }
    return acc;
  }, {} as Record<string, string | number>);

  return useApiQuery<PaginatedTracksResponse, Error>({
    queryKey: queryKeys.tracks.list(definedOptions),
    queryFn: () => fetchTracks(options),
    placeholderData: (previousData) => previousData,
  });
}
