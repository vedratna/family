import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

interface SetupChecklistProps {
  items: ChecklistItem[];
  onDismiss: () => void;
}

export function SetupChecklist({ items, onDismiss }: SetupChecklistProps) {
  const theme = useTheme();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  const completedCount = items.filter((item) => item.completed).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.accent.light }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Quick Setup</Text>
        <Pressable
          onPress={() => {
            setDismissed(true);
            onDismiss();
          }}
          testID="dismiss-checklist"
        >
          <Text style={[styles.dismiss, { color: theme.colors.text.tertiary }]}>Dismiss</Text>
        </Pressable>
      </View>

      <Text style={[styles.progress, { color: theme.colors.text.secondary }]}>
        {String(completedCount)} of {String(items.length)} complete
      </Text>

      {items.map((item) => (
        <View key={item.id} style={styles.item}>
          <Text
            style={[
              styles.checkbox,
              {
                color: item.completed ? theme.colors.semantic.success : theme.colors.text.tertiary,
              },
            ]}
          >
            {item.completed ? "\u2611" : "\u2610"}
          </Text>
          <Text
            style={[
              styles.itemLabel,
              {
                color: item.completed ? theme.colors.text.tertiary : theme.colors.text.primary,
                textDecorationLine: item.completed ? "line-through" : "none",
              },
            ]}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  dismiss: {
    fontSize: 13,
  },
  progress: {
    fontSize: 13,
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  checkbox: {
    fontSize: 18,
  },
  itemLabel: {
    fontSize: 14,
  },
});
