import { useApiQuery } from "@/hooks/use-api-query";

import { apiClient } from "./client";

export const genreQueryKeys = {
  all: () => ["genres"] as const,
  list: () => [...genreQueryKeys.all(), "list"] as const,
};
export const genresApi = {
  async getGenres() {
    return apiClient.getApigenres();
  },
};

export const useGetGenres = () => {
  return useApiQuery({
    queryKey: genreQueryKeys.list(),
    queryFn: () => genresApi.getGenres(),
    staleTime: 60 * 1000 * 5, // 5 minutes
  });
};
