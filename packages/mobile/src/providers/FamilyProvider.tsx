import type { Family } from "@family-app/shared";
import type { ThemeName } from "@family-app/shared";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

import { useConfig } from "./ConfigProvider";
import { useMockData } from "./MockDataProvider";

interface FamilyContextValue {
  activeFamilyId: string;
  activeFamily: Family | undefined;
  activeThemeName: ThemeName;
  families: Family[];
  memberCount: number;
  switchFamily: (familyId: string) => void;
}

const FamilyContext = createContext<FamilyContextValue>({
  activeFamilyId: "",
  activeFamily: undefined,
  activeThemeName: "teal",
  families: [],
  memberCount: 0,
  switchFamily: () => undefined,
});

interface FamilyProviderProps {
  children: ReactNode;
}

export function FamilyProvider({ children }: FamilyProviderProps) {
  const { isMockMode } = useConfig();
  const mockData = useMockData();

  const families = isMockMode ? mockData.families : [];
  const [activeFamilyId, setActiveFamilyId] = useState(families[0]?.id ?? "");

  const activeFamily = families.find((f) => f.id === activeFamilyId);
  const activeThemeName: ThemeName = activeFamily?.themeName ?? "teal";
  const memberCount = isMockMode
    ? mockData.memberships.filter((m) => m.familyId === activeFamilyId).length
    : 0;

  const switchFamily = useCallback((familyId: string) => {
    setActiveFamilyId(familyId);
  }, []);

  return (
    <FamilyContext.Provider
      value={{ activeFamilyId, activeFamily, activeThemeName, families, memberCount, switchFamily }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily(): FamilyContextValue {
  return useContext(FamilyContext);
}
