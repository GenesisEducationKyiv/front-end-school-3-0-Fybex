import { useApiQuery } from "@/hooks/use-api-query";

import { genreQueryKeys, genresApi } from "./service";

export const useGetGenres = () => {
  return useApiQuery({
    queryKey: genreQueryKeys.list(),
    queryFn: () => genresApi.getGenres(),
    staleTime: 60 * 1000 * 5, // 5 minutes
  });
};
