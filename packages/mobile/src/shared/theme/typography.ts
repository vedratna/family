import { Platform } from "react-native";

const fontFamily = Platform.select({
  ios: "System",
  android: "Roboto",
  default: "System",
});

export const typography = {
  fontFamily,

  size: {
    xs: 13,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
  },

  weight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },

  lineHeight: {
    xs: 18,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 30,
    "2xl": 36,
    "3xl": 42,
  },

  variant: {
    h1: { fontSize: 30, fontWeight: "700" as const, lineHeight: 42 },
    h2: { fontSize: 24, fontWeight: "600" as const, lineHeight: 36 },
    h3: { fontSize: 20, fontWeight: "600" as const, lineHeight: 30 },
    body: { fontSize: 16, fontWeight: "400" as const, lineHeight: 24 },
    bodyMedium: { fontSize: 16, fontWeight: "500" as const, lineHeight: 24 },
    caption: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
    small: { fontSize: 13, fontWeight: "400" as const, lineHeight: 18 },
  },
} as const;
