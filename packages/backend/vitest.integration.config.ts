import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["src/repositories/dynamodb/__tests__/**/*.integration.test.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 94,
        statements: 95,
      },
      include: ["src/repositories/dynamodb/**/*.ts"],
      exclude: [
        "src/repositories/dynamodb/__tests__/**",
        "src/repositories/dynamodb/seed.ts",
        "src/repositories/dynamodb/index.ts",
        "src/repositories/dynamodb/s3-storage-service.ts",
        "src/repositories/dynamodb/client.ts",
        "src/repositories/dynamodb/keys.ts",
        "src/repositories/dynamodb/operations.ts",
      ],
    },
  },
});
