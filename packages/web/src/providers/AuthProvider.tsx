import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

import { isCognitoMode, getCognitoConfig } from "../lib/auth/auth-mode";
import type { AuthTokens } from "../lib/auth/cognito-client";
import { cognitoRefresh, cognitoSignOut } from "../lib/auth/cognito-client";
import {
  loadStoredSession,
  saveSession,
  clearSession,
  isTokenExpiring,
} from "../lib/auth/jwt-storage";

export interface CurrentUser {
  id: string;
  displayName: string;
  phone: string;
}

export interface AuthContextValue {
  currentUser: CurrentUser | null;
  /** Local mode entry point */
  loginLocal: (user: CurrentUser) => void;
  /** Cognito mode entry point */
  loginCognito: (tokens: AuthTokens, user: CurrentUser) => void;
  logout: () => void;
  /** Returns a valid idToken for Cognito mode, or null in local mode / when logged out */
  getValidIdToken: () => Promise<string | null>;
}

const LOCAL_STORAGE_KEY = "family-app-current-user";

function loadPersistedUser(): CurrentUser | null {
  if (isCognitoMode()) {
    const session = loadStoredSession();
    return session?.user ?? null;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw !== null && raw !== "") {
      const parsed: unknown = JSON.parse(raw);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "id" in parsed &&
        "displayName" in parsed &&
        "phone" in parsed
      ) {
        return parsed as CurrentUser;
      }
    }
  } catch {
    // ignore corrupt storage
  }
  return null;
}

function loadPersistedTokens(): AuthTokens | null {
  if (!isCognitoMode()) return null;
  const session = loadStoredSession();
  return session?.tokens ?? null;
}

const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  loginLocal: () => undefined,
  loginCognito: () => undefined,
  logout: () => undefined,
  getValidIdToken: () => Promise.resolve(null),
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState(loadPersistedUser);
  const tokensRef = useRef(loadPersistedTokens());

  const loginLocal = useCallback((user: CurrentUser) => {
    setCurrentUser(user);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
  }, []);

  const loginCognito = useCallback((tokens: AuthTokens, user: CurrentUser) => {
    tokensRef.current = tokens;
    setCurrentUser(user);
    saveSession({ tokens, user });
  }, []);

  const logout = useCallback(() => {
    if (isCognitoMode()) {
      const config = getCognitoConfig();
      if (config) {
        cognitoSignOut(config);
      }
      clearSession();
      tokensRef.current = null;
    }
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  const getValidIdToken = useCallback(async (): Promise<string | null> => {
    if (!isCognitoMode()) return null;

    const tokens = tokensRef.current;
    if (!tokens) return null;

    if (!isTokenExpiring(tokens)) {
      return tokens.idToken;
    }

    // Token is expiring, try to refresh
    const config = getCognitoConfig();
    if (!config) return null;

    // We need the phone from currentUser to refresh
    // Use a direct read of the stored session since we can't read React state in a callback reliably
    const stored = loadStoredSession();
    if (!stored) return null;

    try {
      const newTokens = await cognitoRefresh(config, stored.user.phone, tokens.refreshToken);
      tokensRef.current = newTokens;
      saveSession({ tokens: newTokens, user: stored.user });
      return newTokens.idToken;
    } catch {
      // Refresh failed — log out
      tokensRef.current = null;
      clearSession();
      setCurrentUser(null);
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ currentUser, loginLocal, loginCognito, logout, getValidIdToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
