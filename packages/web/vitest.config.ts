import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        branches: 95,
        lines: 95,
        functions: 95,
        statements: 90,
      },
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/__tests__/**",
        "src/test-setup.ts",
        // Entry point — renders <App />, not unit-testable
        "src/main.tsx",
        // Vite type declarations — no runtime code
        "src/vite-env.d.ts",
        // Top-level App component with routing — covered by E2E tests
        "src/App.tsx",
        // Page components — complex UI with data fetching, covered by E2E tests
        "src/pages/**",
        // Provider components — React context wrappers with hooks, covered by E2E tests
        "src/providers/**",
        // Layout components — shell UI with routing, covered by E2E tests
        "src/layout/**",
        // Trivial presentational components — no logic to test
        "src/components/Loading.tsx",
        "src/components/MediaThumbnail.tsx",
        // ProtectedRoute depends on AuthProvider context — covered by E2E tests
        "src/components/ProtectedRoute.tsx",
        // QueryError is a thin wrapper around formatErrorMessage — already tested
        "src/components/QueryError.tsx",
        // GraphQL operations — generated/declarative queries, no logic to unit-test
        "src/lib/graphql-operations.ts",
        // Custom hooks — tightly coupled to providers/urql, covered by E2E tests
        "src/lib/hooks.ts",
        // Auth internals — Cognito integration, covered by E2E tests
        "src/lib/auth/cognito-client.ts",
        "src/lib/auth/derive-password.ts",
        "src/lib/auth/jwt-storage.ts",
        // Data mode configuration — simple env-var read
        "src/lib/mode.ts",
      ],
    },
  },
});
