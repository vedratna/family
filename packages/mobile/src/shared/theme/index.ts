import { createContext, useContext } from "react";

import { darkColors, lightColors, type BaseColors } from "./colors/base";
import { darkModeAccents } from "./colors/dark-mode";
import { themes, type AccentPalette, type ThemeName, DEFAULT_THEME } from "./colors/themes";
import { radius } from "./radius";
import { shadows } from "./shadows";
import { spacing } from "./spacing";
import { typography } from "./typography";

export interface Theme {
  colors: BaseColors & { accent: AccentPalette };
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  isDark: boolean;
}

export function buildTheme(themeName: ThemeName, isDark: boolean): Theme {
  const baseColors = isDark ? darkColors : lightColors;
  const accent = isDark ? darkModeAccents[themeName] : themes[themeName];

  return {
    colors: { ...baseColors, accent },
    typography,
    spacing,
    radius,
    shadows,
    isDark,
  };
}

const defaultTheme = buildTheme(DEFAULT_THEME, false);

const ThemeContext = createContext(defaultTheme);

export const ThemeProvider = ThemeContext.Provider;

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

export { themes, themeNames, DEFAULT_THEME } from "./colors/themes";
export type { ThemeName, AccentPalette } from "./colors/themes";
export { spacing } from "./spacing";
export { typography } from "./typography";
export { radius } from "./radius";
export { shadows } from "./shadows";
