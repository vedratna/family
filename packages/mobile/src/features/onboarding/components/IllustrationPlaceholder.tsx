import { View, Text, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

interface IllustrationPlaceholderProps {
  name: string;
  size?: number;
}

/**
 * Placeholder component for Open Peeps / unDraw illustrations.
 * Will be replaced with actual illustration assets tinted with the family accent color.
 */
export function IllustrationPlaceholder({ name, size = 160 }: IllustrationPlaceholderProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor: theme.colors.accent.light,
          borderRadius: size / 8,
        },
      ]}
      testID={`illustration-${name}`}
    >
      <Text style={[styles.label, { color: theme.colors.accent.primary }]}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});
