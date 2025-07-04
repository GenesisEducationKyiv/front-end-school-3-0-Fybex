interface HealthResponse {
  status: string;
}

export async function checkBackendHealth(): Promise<void> {
  const API_BASE_URL = process.env.VITE_API_URL ?? "http://localhost:8000";
  const healthUrl = `${API_BASE_URL}/health`;

  try {
    const response = await fetch(healthUrl);

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status.toString()}: ${response.statusText}`
      );
    }

    const data = (await response.json()) as HealthResponse;

    if (data.status !== "ok") {
      throw new Error(`Backend health check failed: ${data.status}`);
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
