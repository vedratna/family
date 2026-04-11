import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

interface PendingSuggestion {
  personAName: string;
  personBName: string;
  aToBLabel: string;
  bToALabel: string;
  personAId: string;
  personBId: string;
}

interface PendingSuggestionsScreenProps {
  suggestions: PendingSuggestion[];
  onConfirm: (personAId: string, personBId: string) => void;
  onReject: (personAId: string, personBId: string) => void;
}

export function PendingSuggestionsScreen({
  suggestions,
  onConfirm,
  onReject,
}: PendingSuggestionsScreenProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        Suggested Relationships
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
        We inferred these from existing relationships. Confirm or dismiss.
      </Text>

      <FlatList
        data={suggestions}
        keyExtractor={(item) => `${item.personAId}-${item.personBId}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.colors.background.card }]}>
            <Text style={[styles.suggestion, { color: theme.colors.text.primary }]}>
              {item.personAName} is <Text style={{ fontWeight: "700" }}>{item.aToBLabel}</Text> of{" "}
              {item.personBName}
            </Text>
            <Text style={[styles.reverse, { color: theme.colors.text.secondary }]}>
              ({item.personBName} is {item.bToALabel} of {item.personAName})
            </Text>
            <View style={styles.actions}>
              <Pressable
                style={[styles.confirmButton, { backgroundColor: theme.colors.semantic.success }]}
                onPress={() => { onConfirm(item.personAId, item.personBId); }}
                testID={`confirm-${item.personAId}-${item.personBId}`}
              >
                <Text style={styles.actionText}>Confirm</Text>
              </Pressable>
              <Pressable
                style={[styles.rejectButton, { borderColor: theme.colors.semantic.error }]}
                onPress={() => { onReject(item.personAId, item.personBId); }}
                testID={`reject-${item.personAId}-${item.personBId}`}
              >
                <Text style={[styles.rejectText, { color: theme.colors.semantic.error }]}>
                  Dismiss
                </Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.colors.text.tertiary }]}>
            No pending suggestions.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
  title: { fontSize: 22, fontWeight: "600", paddingHorizontal: 8 },
  subtitle: { fontSize: 14, paddingHorizontal: 8, marginBottom: 20 },
  list: { gap: 12 },
  card: { borderRadius: 12, padding: 16, gap: 8 },
  suggestion: { fontSize: 16, lineHeight: 24 },
  reverse: { fontSize: 13 },
  actions: { flexDirection: "row", gap: 12, marginTop: 8 },
  confirmButton: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  actionText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  rejectButton: { borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  rejectText: { fontSize: 14, fontWeight: "500" },
  empty: { fontSize: 15, textAlign: "center", marginTop: 40 },
});
