import "vite-plus/test/config";
import * as NodeURL from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

const IGNORED = ["dist", "node_modules", "pnpm-lock.yaml", "*.tsbuildinfo", "docs/prototype/**"];

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "~": NodeURL.fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5810,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Flaky tests are fixed, not retried.
    retry: 0,
  },
  fmt: {
    ignorePatterns: IGNORED,
    sortPackageJson: {},
  },
  lint: {
    ignorePatterns: IGNORED,
    plugins: ["eslint", "oxc", "react", "unicorn", "typescript"],
    categories: {
      correctness: "warn",
      suspicious: "warn",
      perf: "warn",
    },
    rules: {
      "oxc/no-accumulating-spread": "error",
      "react/no-array-index-key": "error",
      "react/exhaustive-deps": "error",
      // The automatic JSX runtime needs no React import.
      "react/react-in-jsx-scope": "off",
      // Effect tags its unions with `_tag`.
      "eslint/no-underscore-dangle": "off",
    },
  },
});
