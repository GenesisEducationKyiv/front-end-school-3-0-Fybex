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
      command:
        process.env.E2E_SKIP_BUILD === "true"
          ? "npm run client:preview"
          : "npm run client:build-and-preview",
      url: "http://localhost:4173",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      name: "Client",
      cwd: "../"
    },
    {
      command:
        process.env.E2E_SKIP_BUILD === "true"
          ? "npm run server:start"
          : "npm run server:build-and-start",
      url: "http://localhost:8000/healthz",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      name: "Server",
      cwd: "../"
    },
  ],
});
