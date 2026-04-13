import type { AuthTokens } from "./cognito-client";

const STORAGE_KEY = "family-app-cognito-tokens";

export interface StoredCognitoSession {
  tokens: AuthTokens;
  user: { id: string; phone: string; displayName: string };
}

export function loadStoredSession(): StoredCognitoSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null || raw === "") return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && "tokens" in parsed && "user" in parsed) {
      return parsed as StoredCognitoSession;
    }
  } catch {
    // ignore
  }
  return null;
}

export function saveSession(session: StoredCognitoSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Returns true if the access token expires within `bufferMs` (default 5 min). */
export function isTokenExpiring(tokens: AuthTokens, bufferMs = 5 * 60 * 1000): boolean {
  return Date.now() + bufferMs >= tokens.expiresAt;
}
