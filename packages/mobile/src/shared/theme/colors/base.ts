export const lightColors = {
  background: {
    primary: "#FAFAF8",
    card: "#FFFFFF",
    secondary: "#F4F3F0",
    tertiary: "#EDECEA",
  },
  text: {
    primary: "#1A1A1A",
    secondary: "#6B6966",
    tertiary: "#9C9894",
    inverse: "#FFFFFF",
  },
  semantic: {
    error: "#D4483B",
    warning: "#E8913A",
    success: "#4A9E6B",
    errorLight: "#FDECEA",
    warningLight: "#FFF3E0",
    successLight: "#E8F5E9",
  },
  border: {
    primary: "#E0DFDC",
    secondary: "#EDECEA",
  },
} as const;

export const darkColors = {
  background: {
    primary: "#1A1A1A",
    card: "#242422",
    secondary: "#2E2E2C",
    tertiary: "#383836",
  },
  text: {
    primary: "#F0EFED",
    secondary: "#A8A5A0",
    tertiary: "#7A7672",
    inverse: "#1A1A1A",
  },
  semantic: {
    error: "#E57373",
    warning: "#FFB74D",
    success: "#81C784",
    errorLight: "#3D2222",
    warningLight: "#3D3222",
    successLight: "#223D22",
  },
  border: {
    primary: "#383836",
    secondary: "#2E2E2C",
  },
} as const;

export interface BaseColors {
  background: { primary: string; card: string; secondary: string; tertiary: string };
  text: { primary: string; secondary: string; tertiary: string; inverse: string };
  semantic: {
    error: string;
    warning: string;
    success: string;
    errorLight: string;
    warningLight: string;
    successLight: string;
  };
  border: { primary: string; secondary: string };
}
