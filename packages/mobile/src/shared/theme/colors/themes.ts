export interface AccentPalette {
  primary: string;
  dark: string;
  light: string;
  onColor: string;
}

export const themes = {
  teal: {
    primary: "#2B8A7E",
    dark: "#237069",
    light: "#E6F4F2",
    onColor: "#FFFFFF",
  },
  indigo: {
    primary: "#5B5FC7",
    dark: "#4A4EB5",
    light: "#EDEDFA",
    onColor: "#FFFFFF",
  },
  coral: {
    primary: "#C96B5B",
    dark: "#B35A4A",
    light: "#FAEAE7",
    onColor: "#FFFFFF",
  },
  sage: {
    primary: "#6B8F71",
    dark: "#5A7A5F",
    light: "#E8F0E9",
    onColor: "#FFFFFF",
  },
  amber: {
    primary: "#B8860B",
    dark: "#9A7209",
    light: "#F5EDD6",
    onColor: "#FFFFFF",
  },
  ocean: {
    primary: "#3A7CA5",
    dark: "#2E6384",
    light: "#E3EFF5",
    onColor: "#FFFFFF",
  },
  plum: {
    primary: "#8B5E83",
    dark: "#744D6D",
    light: "#F2E8F0",
    onColor: "#FFFFFF",
  },
  slate: {
    primary: "#64748B",
    dark: "#4F5D73",
    light: "#E8ECF0",
    onColor: "#FFFFFF",
  },
} as const;

export type ThemeName = keyof typeof themes;

export const DEFAULT_THEME: ThemeName = "teal";

export const themeNames: readonly ThemeName[] = [
  "teal",
  "indigo",
  "coral",
  "sage",
  "amber",
  "ocean",
  "plum",
  "slate",
] as const;
