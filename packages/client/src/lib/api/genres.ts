import { createConnectQueryKey } from "@connectrpc/connect-query";
import { getGenres } from "@music-app/proto";

import { useApiQuery } from "@/hooks/useApiQuery";

export const genreQueryKeys = {
  all: () =>
    createConnectQueryKey({ schema: getGenres, cardinality: "finite" }),
};

export const useGetGenres = () => {
  const response = useApiQuery(
    getGenres,
    {},
    {
      staleTime: 60 * 1000 * 5, // 5 minutes
    }
  );
  return response.data?.genres ?? [];
};
