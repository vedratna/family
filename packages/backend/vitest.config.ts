import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    exclude: ["**/node_modules/**", "**/*.integration.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        branches: 95,
        lines: 95,
        functions: 95,
        statements: 90,
      },
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/__tests__/**",
        // Type-only interface files — no runtime code to cover
        "src/repositories/interfaces/**",
        // DynamoDB repository implementations — covered by integration tests
        "src/repositories/dynamodb/**",
        // Index re-export barrels — no logic, just re-exports
        "src/use-cases/*/index.ts",
        // Local dev server entry point — not unit-testable (starts Apollo, reads filesystem)
        "src/local-server/**",
        // CachedFamilyTree directly imports DynamoDB operations — integration-only
        "src/use-cases/tree/cached-family-tree.ts",
      ],
    },
  },
});
