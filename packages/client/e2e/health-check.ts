import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { HealthService } from "@music-app/proto";

export async function checkBackendHealth(): Promise<void> {
  const API_BASE_URL = process.env.VITE_API_URL ?? "http://localhost:8000";

  const transport = createConnectTransport({
    baseUrl: API_BASE_URL,
  });

  const client = createClient(HealthService, transport);

  try {
    const response = await client.healthCheck({});

    if (response.status !== "OK") {
      throw new Error(`Backend health check failed: ${response.status}`);
    }
  } catch (error) {
    console.error("Backend health check failed:", error);
    throw new Error(
      `Backend is not available. Please ensure the backend server is running at ${API_BASE_URL}. Error: ${String(
        error
      )}`
    );
  }
}
