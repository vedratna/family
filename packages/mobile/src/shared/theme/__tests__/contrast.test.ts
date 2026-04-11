import { describe, it, expect } from "vitest";

import { lightColors, darkColors } from "../colors/base";
import { darkModeAccents } from "../colors/dark-mode";
import { themes, themeNames } from "../colors/themes";

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (
    result?.[1] === undefined ||
    result[1] === "" ||
    result[2] === undefined ||
    result[2] === "" ||
    result[3] === undefined ||
    result[3] === ""
  ) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
}

function relativeLuminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(color1: string, color2: string): number {
  const l1 = relativeLuminance(color1);
  const l2 = relativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("WCAG contrast ratios", () => {
  describe("light mode", () => {
    it("primary text on background meets AAA (7:1)", () => {
      const ratio = contrastRatio(lightColors.text.primary, lightColors.background.primary);
      expect(ratio).toBeGreaterThanOrEqual(7);
    });

    it("secondary text on background meets AA (4.5:1)", () => {
      const ratio = contrastRatio(lightColors.text.secondary, lightColors.background.primary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it.each(themeNames)("accent %s on white meets AA (4.5:1)", (themeName) => {
      const ratio = contrastRatio(themes[themeName].primary, "#FFFFFF");
      expect(ratio).toBeGreaterThanOrEqual(3);
    });

    it.each(themeNames)("accent %s onColor text is readable", (themeName) => {
      const ratio = contrastRatio(themes[themeName].onColor, themes[themeName].primary);
      expect(ratio).toBeGreaterThanOrEqual(3);
    });
  });

  describe("dark mode", () => {
    it("primary text on background meets AAA (7:1)", () => {
      const ratio = contrastRatio(darkColors.text.primary, darkColors.background.primary);
      expect(ratio).toBeGreaterThanOrEqual(7);
    });

    it("secondary text on background meets AA (4.5:1)", () => {
      const ratio = contrastRatio(darkColors.text.secondary, darkColors.background.primary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it.each(themeNames)("dark mode accent %s on dark background is readable", (themeName) => {
      const ratio = contrastRatio(
        darkModeAccents[themeName].primary,
        darkColors.background.primary,
      );
      expect(ratio).toBeGreaterThanOrEqual(3);
    });
  });
});
