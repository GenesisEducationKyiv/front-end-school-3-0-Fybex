/// <reference types="vitest/config" />
import path from "path";
import { fileURLToPath } from "url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chunkGroups = {
  ui: ["@radix-ui", "@floating-ui", "sonner"],
  forms: ["react-hook-form", "@hookform", "zod"],
  query: [
    "@tanstack/react-query",
    "@tanstack/query-core",
    "@connectrpc",
    "@bufbuild",
    "zustand",
  ],
  react: ["react", "react-dom"],
};

export const baseSharedConfig = {
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};

// https://vite.dev/config/
export default defineConfig({
  ...baseSharedConfig,
  optimizeDeps: {
    include: ["@radix-ui/react-slot"],
  },
  plugins: [
    react(),
    tailwindcss(),
    ...(process.env.ANALYZE === "true"
      ? [
          visualizer({
            filename: "dist/stats.html",
            open: true,
            gzipSize: true,
            brotliSize: true,
          }),
        ]
      : []),
  ],
  build: {
    rollupOptions: {
      external: (id: string) => {
        return (
          id.includes("__tests__") ||
          id.includes(".test.") ||
          id.includes(".spec.")
        );
      },
      output: {
        manualChunks: (id: string) => {
          if (id.includes("node_modules")) {
            for (const [chunkName, pkgs] of Object.entries(chunkGroups)) {
              if (pkgs.some((pkg) => id.includes(pkg))) {
                return chunkName;
              }
            }
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
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
});
