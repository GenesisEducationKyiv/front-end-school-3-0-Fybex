import { defineConfig } from "@playwright/experimental-ct-react";

import { baseSharedConfig } from "vite.config";

export default defineConfig({
  testDir: "./src/components",
  testMatch: "*.ct.tsx",
  use: {
    ctViteConfig: baseSharedConfig,
    ctPort: 3100,
    ctTemplateDir: "./playwright-ct",
  },
});
