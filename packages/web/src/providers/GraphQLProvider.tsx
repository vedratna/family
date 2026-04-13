import { useMemo, type ReactNode } from "react";
import { Client, Provider, fetchExchange, cacheExchange } from "urql";

import { useAuth } from "./AuthProvider";

const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:4000/graphql";

interface GraphQLProviderProps {
  children: ReactNode;
}

export function GraphQLProvider({ children }: GraphQLProviderProps) {
  const { currentUser } = useAuth();

  const client = useMemo(() => {
    return new Client({
      url: API_URL,
      exchanges: [cacheExchange, fetchExchange],
      fetchOptions: () => {
        const headers: Record<string, string> = {};
        if (currentUser) {
          headers["x-user-id"] = currentUser.id;
        }
        return { headers };
      },
    });
  }, [currentUser]);

  return <Provider value={client}>{children}</Provider>;
}
