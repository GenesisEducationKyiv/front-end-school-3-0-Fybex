import { defineConfig } from "@playwright/experimental-ct-react";

import { sharedViteConfig } from "./vite.config";

export default defineConfig({
  testDir: "./src/components",
  testMatch: "*.ct.tsx",
  use: {
    ctViteConfig: sharedViteConfig,
    ctPort: 3100,
    ctTemplateDir: "./playwright-ct",
  },
});
