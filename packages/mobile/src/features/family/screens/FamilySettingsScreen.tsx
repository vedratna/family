import type { ThemeName } from "@family-app/shared";
import { View, Text, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";
import { ThemeColorPicker } from "../../onboarding/components/ThemeColorPicker";

interface FamilySettingsScreenProps {
  familyName: string;
  currentTheme: ThemeName;
  canManage: boolean;
  onThemeChange: (themeName: ThemeName) => void;
}

export function FamilySettingsScreen({
  familyName,
  currentTheme,
  canManage,
  onThemeChange,
}: FamilySettingsScreenProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>{familyName}</Text>

      <Text style={[styles.sectionLabel, { color: theme.colors.text.secondary }]}>
        Family Theme
      </Text>

      {canManage ? (
        <ThemeColorPicker selected={currentTheme} onSelect={onThemeChange} />
      ) : (
        <Text style={[styles.readOnly, { color: theme.colors.text.tertiary }]}>
          Only admins and owners can change the theme.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  readOnly: {
    fontSize: 14,
  },
});
