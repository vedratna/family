import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environmentMatchGlobs: [["src/**/*.tsx", "jsdom"]],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      // Mobile coverage thresholds deferred until mobile E2E + unit test pass is complete
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/__tests__/**", "src/test-setup.ts"],
    },
  },
});
