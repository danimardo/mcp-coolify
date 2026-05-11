import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/index.ts"
      ]
    }
  },
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, "./src/lib"),
      $server: path.resolve(__dirname, "./src/server"),
      $tools: path.resolve(__dirname, "./src/lib/tools")
    }
  }
});
