import { apiClient } from "@/lib/api/client";

export const genreQueryKeys = {
  all: () => ["genres"] as const,
  list: () => [...genreQueryKeys.all(), "list"] as const,
};
export const genresApi = {
  async getGenres() {
    return apiClient.getApigenres();
  },
};
