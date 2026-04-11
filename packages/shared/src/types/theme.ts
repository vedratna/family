export const THEME_NAMES = [
  "teal",
  "indigo",
  "coral",
  "sage",
  "amber",
  "ocean",
  "plum",
  "slate",
] as const;

export type ThemeName = (typeof THEME_NAMES)[number];

export const DEFAULT_THEME_NAME: ThemeName = "teal";
