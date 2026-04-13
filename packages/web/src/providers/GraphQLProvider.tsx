import { useMemo, type ReactNode } from "react";
import { Client, Provider, fetchExchange, cacheExchange } from "urql";

import { isCognitoMode } from "../lib/auth/auth-mode";

import { useAuth } from "./AuthProvider";

const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:4000/graphql";

interface GraphQLProviderProps {
  children: ReactNode;
}

export function GraphQLProvider({ children }: GraphQLProviderProps) {
  const { currentUser, getValidIdToken } = useAuth();

  const client = useMemo(() => {
    return new Client({
      url: API_URL,
      exchanges: [cacheExchange, fetchExchange],
      fetchOptions: () => {
        const headers: Record<string, string> = {};
        if (!isCognitoMode() && currentUser) {
          headers["x-user-id"] = currentUser.id;
        }
        return { headers };
      },
      fetch: async (input, init) => {
        if (isCognitoMode()) {
          const token = await getValidIdToken();
          const headers: Record<string, string> = {};
          // Copy existing headers
          if (init?.headers) {
            const existing = init.headers as Record<string, string>;
            for (const [key, value] of Object.entries(existing)) {
              headers[key] = value;
            }
          }
          if (token !== null) {
            headers["Authorization"] = `Bearer ${token}`;
          }
          return fetch(input, { ...init, headers });
        }
        return fetch(input, init);
      },
    });
  }, [currentUser, getValidIdToken]);

  return <Provider value={client}>{children}</Provider>;
}
