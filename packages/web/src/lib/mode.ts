/**
 * Returns true when the app is running in API mode (i.e. a real GraphQL backend
 * is available).  Set `VITE_DATA_MODE=api` in your .env to activate.
 *
 * When the flag is absent or set to any other value the app falls back to the
 * in-memory mock data that ships with MockDataProvider.
 */
export function isApiMode(): boolean {
  return import.meta.env.VITE_DATA_MODE === "api";
}
