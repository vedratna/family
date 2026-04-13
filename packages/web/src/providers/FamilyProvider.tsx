import type { Family, ThemeName } from "@family-app/shared";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useQuery } from "urql";

import { MY_FAMILIES_QUERY } from "../lib/graphql-operations";
import { isApiMode } from "../lib/mode";

import { useAuth } from "./AuthProvider";
import { useMockData } from "./MockDataProvider";

interface FamilyContextValue {
  activeFamilyId: string;
  activeFamily: Family | undefined;
  activeThemeName: ThemeName;
  families: Family[];
  memberCount: number;
  loading: boolean;
  switchFamily: (familyId: string) => void;
  refetchFamilies: () => void;
}

const FamilyContext = createContext<FamilyContextValue>({
  activeFamilyId: "",
  activeFamily: undefined,
  activeThemeName: "teal",
  families: [],
  memberCount: 0,
  loading: false,
  switchFamily: () => undefined,
  refetchFamilies: () => undefined,
});

interface FamilyProviderProps {
  children: ReactNode;
}

export function FamilyProvider({ children }: FamilyProviderProps) {
  const apiMode = isApiMode();
  const { logout } = useAuth();

  // API mode: query myFamilies from the GraphQL backend
  const [apiResult, reexecuteQuery] = useQuery({
    query: MY_FAMILIES_QUERY,
    pause: !apiMode,
  });

  // Auto-logout if the server says our user doesn't exist (stale localStorage)
  useEffect(() => {
    const err = apiResult.error;
    if (err !== undefined && err.message.includes("USER_NOT_FOUND")) {
      logout();
    }
  }, [apiResult.error, logout]);

  // Mock mode: read from MockDataProvider
  const mockData = useMockData();

  const families = useMemo<Family[]>(() => {
    if (apiMode) {
      const raw = apiResult.data as
        | {
            myFamilies: {
              family: {
                id: string;
                name: string;
                createdBy: string;
                themeName: string;
                createdAt: string;
              };
              role: string;
            }[];
          }
        | undefined;
      return (raw?.myFamilies ?? []).map((entry) => ({
        id: entry.family.id,
        name: entry.family.name,
        createdBy: entry.family.createdBy,
        themeName: entry.family.themeName as ThemeName,
        createdAt: entry.family.createdAt,
      }));
    }
    return mockData.families;
  }, [apiMode, apiResult.data, mockData.families]);

  const [activeFamilyId, setActiveFamilyId] = useState("");

  // Keep activeFamilyId in sync when families load
  const resolvedActiveFamilyId = useMemo(() => {
    if (activeFamilyId && families.some((f) => f.id === activeFamilyId)) {
      return activeFamilyId;
    }
    return families[0]?.id ?? "";
  }, [activeFamilyId, families]);

  const activeFamily = families.find((f) => f.id === resolvedActiveFamilyId);
  const activeThemeName: ThemeName = activeFamily?.themeName ?? "teal";

  const memberCount = useMemo(() => {
    if (apiMode) {
      // In API mode, member count is fetched per-page via FAMILY_MEMBERS_QUERY
      return 0;
    }
    return mockData.memberships.filter((m) => m.familyId === resolvedActiveFamilyId).length;
  }, [apiMode, mockData.memberships, resolvedActiveFamilyId]);

  const loading = apiMode && apiResult.fetching;

  const switchFamily = useCallback((familyId: string) => {
    setActiveFamilyId(familyId);
  }, []);

  const refetchFamilies = useCallback(() => {
    reexecuteQuery({ requestPolicy: "network-only" });
  }, [reexecuteQuery]);

  return (
    <FamilyContext.Provider
      value={{
        activeFamilyId: resolvedActiveFamilyId,
        activeFamily,
        activeThemeName,
        families,
        memberCount,
        loading,
        switchFamily,
        refetchFamilies,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily(): FamilyContextValue {
  return useContext(FamilyContext);
}
