import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export interface CurrentUser {
  id: string;
  displayName: string;
  phone: string;
}

interface AuthContextValue {
  currentUser: CurrentUser | null;
  login: (user: CurrentUser) => void;
  logout: () => void;
}

const STORAGE_KEY = "family-app-current-user";

function loadPersistedUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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

const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  login: () => undefined,
  logout: () => undefined,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(loadPersistedUser);

  const login = useCallback((user: CurrentUser) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
