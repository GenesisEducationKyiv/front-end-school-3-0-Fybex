import { type ApiOf } from "@zodios/core";

import {
  createApiClient,
  schemas as generatedSchemas,
  type api,
} from "@/generated/api";

export type Api = ApiOf<typeof api>;
export const apiSchemas = generatedSchemas;

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";
export const apiClient = createApiClient(API_BASE_URL);
