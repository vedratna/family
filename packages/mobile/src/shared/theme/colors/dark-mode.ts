import type { AccentPalette, ThemeName } from "./themes";

export const darkModeAccents: Record<ThemeName, AccentPalette> = {
  teal: {
    primary: "#3DBCAD",
    dark: "#2B8A7E",
    light: "#1E3330",
    onColor: "#1A1A1A",
  },
  indigo: {
    primary: "#7B7FE0",
    dark: "#5B5FC7",
    light: "#272840",
    onColor: "#1A1A1A",
  },
  coral: {
    primary: "#E0857A",
    dark: "#C96B5B",
    light: "#3D2520",
    onColor: "#1A1A1A",
  },
  sage: {
    primary: "#8AB891",
    dark: "#6B8F71",
    light: "#203325",
    onColor: "#1A1A1A",
  },
  amber: {
    primary: "#D4A830",
    dark: "#B8860B",
    light: "#33290D",
    onColor: "#1A1A1A",
  },
  ocean: {
    primary: "#5A9DC5",
    dark: "#3A7CA5",
    light: "#1A2E3D",
    onColor: "#1A1A1A",
  },
  plum: {
    primary: "#A87DA0",
    dark: "#8B5E83",
    light: "#332030",
    onColor: "#1A1A1A",
  },
  slate: {
    primary: "#8494A7",
    dark: "#64748B",
    light: "#1E2530",
    onColor: "#1A1A1A",
  },
} as const;
