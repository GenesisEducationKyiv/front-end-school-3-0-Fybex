import { createMockRouter } from "@connectrpc/connect-playwright";

export const DEFAULT_MOCK_BASE_URL = "http://localhost:8000";

export function getMockRouter(context: Parameters<typeof createMockRouter>[0]) {
  return createMockRouter(context, { baseUrl: DEFAULT_MOCK_BASE_URL });
}
