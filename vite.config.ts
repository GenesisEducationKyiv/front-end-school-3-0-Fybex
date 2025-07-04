/// <reference types="vitest/config" />
import path from "path";
import { fileURLToPath } from "url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export const sharedViteConfig = {
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: (id: string) => {
        return (
          id.includes("__tests__") ||
          id.includes(".test.") ||
          id.includes(".spec.")
        );
      },
    },
  },
  test: {
    environment: "jsdom",
    projects: [
      {
        extends: true as const,
        test: {
          name: "unit",
          include: ["**/*.unit.test.ts", "**/*.unit.test.tsx"],
        },
      },
      {
        extends: true as const,
        test: {
          name: "integration",
          include: ["**/*.integration.test.ts", "**/*.integration.test.tsx"],
        },
      },
    ],
  },
};

export default defineConfig(sharedViteConfig);
