import { useState, useCallback, useMemo, createContext, useContext, type ReactNode } from "react";

import type { TabKey } from "./TabNavigator";

type ScreenParams = Record<string, string>;

interface NavigationState {
  screen: string;
  params: ScreenParams;
}

interface NavigationContextValue {
  activeTab: TabKey;
  screenState: NavigationState;
  navigate: (screen: string, params?: ScreenParams) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

const DEFAULT_SCREENS: Record<TabKey, string> = {
  feed: "list",
  calendar: "agenda",
  tree: "tree",
  chores: "list",
  more: "menu",
};

const INITIAL_STACKS: Record<TabKey, NavigationState[]> = {
  feed: [{ screen: "list", params: {} }],
  calendar: [{ screen: "agenda", params: {} }],
  tree: [{ screen: "tree", params: {} }],
  chores: [{ screen: "list", params: {} }],
  more: [{ screen: "menu", params: {} }],
};

interface ScreenRouterProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  children: (ctx: NavigationContextValue) => ReactNode;
}

export function ScreenRouter({ activeTab, children }: ScreenRouterProps) {
  const [stacks, setStacks] = useState(INITIAL_STACKS);

  const navigate = useCallback(
    (screen: string, params: ScreenParams = {}) => {
      setStacks((prev) => ({
        ...prev,
        [activeTab]: [...prev[activeTab], { screen, params }],
      }));
    },
    [activeTab],
  );

  const goBack = useCallback(() => {
    setStacks((prev) => {
      const stack = prev[activeTab];
      if (stack.length <= 1) {
        return prev;
      }
      return {
        ...prev,
        [activeTab]: stack.slice(0, -1),
      };
    });
  }, [activeTab]);

  const screenState = useMemo(() => {
    const stack = stacks[activeTab];
    const top = stack[stack.length - 1];
    return top ?? { screen: DEFAULT_SCREENS[activeTab], params: {} };
  }, [stacks, activeTab]);

  const ctx = useMemo(
    () => ({ activeTab, screenState, navigate, goBack }),
    [activeTab, screenState, navigate, goBack],
  );

  return <NavigationContext.Provider value={ctx}>{children(ctx)}</NavigationContext.Provider>;
}

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (ctx === null) {
    throw new Error("useNavigation must be used within ScreenRouter");
  }
  return ctx;
}
