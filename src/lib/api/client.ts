import { createApiClient } from "../../generated/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";
export const apiClient = createApiClient(API_BASE_URL);
