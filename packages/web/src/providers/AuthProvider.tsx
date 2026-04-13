import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface CurrentUser {
  id: string;
  displayName: string;
}

interface AuthContextValue {
  currentUser: CurrentUser | null;
  login: (userId: string, displayName: string) => void;
  logout: () => void;
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
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const login = useCallback((userId: string, displayName: string) => {
    setCurrentUser({ id: userId, displayName });
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
