import path from "node:path";

import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
/// <reference types="vitest/config" />
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      quoteStyle: "double",
      semicolons: true,
      routeTreeFileHeader: ["/* oxlint-disable */", "// @ts-nocheck", "// noinspection JSUnusedGlobalSymbols"],
    }),
    react(),
  ],
  envDir: "env",
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  test: {
    globals: true,
  },
});
