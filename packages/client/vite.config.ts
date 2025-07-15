/// <reference types="vitest/config" />
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientPkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "package.json"), "utf-8")
) as {
  dependencies: Record<string, string>;
};
const dependencies = Object.keys(clientPkg.dependencies);
const chunkGroupPrefixes: Record<string, string[]> = {
  ui: [
    "@radix-ui/",
    "sonner",
    "cmdk",
    "tailwind-merge",
    "tailwindcss",
    "lucide-react",
    "@tanstack/react-table",
  ],
  forms: ["react-hook-form", "@hookform/", "zod"],
  query: [
    "@tanstack/react-query",
    "@tanstack/query-core",
    "@connectrpc/",
    "@bufbuild/",
    "zustand",
  ],
};
const chunkGroups: Record<string, string[]> = {};
for (const [groupName, prefixes] of Object.entries(chunkGroupPrefixes)) {
  const pkgs: string[] = [];
  for (const prefix of prefixes) {
    if (prefix.endsWith("/")) {
      for (const dep of dependencies) {
        if (dep.startsWith(prefix)) {
          pkgs.push(dep);
        }
      }
    } else {
      if (dependencies.includes(prefix)) {
        pkgs.push(prefix);
      }
    }
  }
  chunkGroups[groupName] = pkgs;
}

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
        manualChunks: chunkGroups,
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
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(__dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
