import { View, Text, Pressable, StyleSheet } from "react-native";

import { IllustrationPlaceholder } from "../../features/onboarding/components/IllustrationPlaceholder";
import { useTheme } from "../theme";

interface EmptyStateProps {
  illustrationName: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  illustrationName,
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container} testID={`empty-state-${illustrationName}`}>
      <IllustrationPlaceholder name={illustrationName} size={140} />

      <Text style={[styles.title, { color: theme.colors.text.primary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>{subtitle}</Text>

      {actionLabel !== undefined && onAction !== undefined && (
        <Pressable
          style={[styles.button, { backgroundColor: theme.colors.accent.primary }]}
          onPress={onAction}
          testID="empty-state-action"
        >
          <Text style={[styles.buttonText, { color: theme.colors.accent.onColor }]}>
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
