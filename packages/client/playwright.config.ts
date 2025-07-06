import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "setup",
      testMatch: "**/global.setup.ts",
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      dependencies: ["setup"],
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      dependencies: ["setup"],
    },
  ],

  webServer: [
    {
      command: "npm run build --workspace=@music-app/client && npm run preview --workspace=@music-app/client",
      url: "http://localhost:4173",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      name: "Client",
    },
    {
      command: "npm run build --workspace=@music-app/server && npm run start --workspace=@music-app/server",
      url: "http://localhost:8000/healthz",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      name: "Server",
    },
  ],
});
