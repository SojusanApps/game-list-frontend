import path from "node:path";

import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
/// <reference types="vitest/config" />
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tanstackRouter(), react()],
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
