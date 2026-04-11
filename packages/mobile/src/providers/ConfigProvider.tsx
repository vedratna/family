import Constants from "expo-constants";
import { createContext, useContext, type ReactNode } from "react";


interface AppConfig {
  isMockMode: boolean;
  apiUrl: string;
  stage: string;
}

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

const defaultConfig: AppConfig = {
  isMockMode: (extra["MOCK_MODE"] as string) !== "false",
  apiUrl: (extra["API_URL"] as string | undefined) ?? "http://localhost:4000/graphql",
  stage: (extra["STAGE"] as string | undefined) ?? "dev",
};

const ConfigContext = createContext(defaultConfig);

interface ConfigProviderProps {
  children: ReactNode;
  overrides?: Partial<AppConfig>;
}

export function ConfigProvider({ children, overrides }: ConfigProviderProps) {
  const config = { ...defaultConfig, ...overrides };
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export function useConfig(): AppConfig {
  return useContext(ConfigContext);
}
