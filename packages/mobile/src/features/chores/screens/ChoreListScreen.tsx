import type { ChoreStatus } from "@family-app/shared";
import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

interface ChoreItem {
  id: string;
  title: string;
  assigneeName: string;
  dueDate?: string;
  status: ChoreStatus;
}

interface ChoreListScreenProps {
  chores: ChoreItem[];
  onChorePress: (choreId: string) => void;
  onCreateChore: () => void;
  onComplete: (choreId: string) => void;
}

export function ChoreListScreen({
  chores,
  onChorePress,
  onCreateChore,
  onComplete,
}: ChoreListScreenProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <FlatList
        data={chores}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isCompleted = item.status === "completed";
          return (
            <Pressable
              style={[styles.choreCard, { backgroundColor: theme.colors.background.card }]}
              onPress={() => {
                onChorePress(item.id);
              }}
              testID={`chore-${item.id}`}
            >
              <Pressable
                style={[
                  styles.checkbox,
                  {
                    borderColor: isCompleted
                      ? theme.colors.semantic.success
                      : theme.colors.border.primary,
                    backgroundColor: isCompleted ? theme.colors.semantic.success : "transparent",
                  },
                ]}
                onPress={() => {
                  if (!isCompleted) {
                    onComplete(item.id);
                  }
                }}
                testID={`complete-chore-${item.id}`}
              >
                {isCompleted && <Text style={styles.checkmark}>{"\u2713"}</Text>}
              </Pressable>
              <View style={styles.choreInfo}>
                <Text
                  style={[
                    styles.choreTitle,
                    {
                      color: isCompleted ? theme.colors.text.tertiary : theme.colors.text.primary,
                      textDecorationLine: isCompleted ? "line-through" : "none",
                    },
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={[styles.choreMeta, { color: theme.colors.text.tertiary }]}>
                  {item.assigneeName}
                  {item.dueDate !== undefined ? ` \u00B7 Due ${item.dueDate}` : ""}
                </Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.colors.text.tertiary }]}>
            No chores. All caught up!
          </Text>
        }
      />

      <Pressable
        style={[styles.createButton, { backgroundColor: theme.colors.accent.primary }]}
        onPress={onCreateChore}
        testID="create-chore-button"
      >
        <Text style={[styles.createButtonText, { color: theme.colors.accent.onColor }]}>
          + New Chore
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 8 },
  choreCard: { flexDirection: "row", borderRadius: 12, padding: 14, gap: 14, alignItems: "center" },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  choreInfo: { flex: 1, gap: 2 },
  choreTitle: { fontSize: 16, fontWeight: "500" },
  choreMeta: { fontSize: 13 },
  empty: { textAlign: "center", marginTop: 40, fontSize: 15 },
  createButton: { borderRadius: 12, paddingVertical: 16, alignItems: "center", margin: 16 },
  createButtonText: { fontSize: 16, fontWeight: "600" },
});
