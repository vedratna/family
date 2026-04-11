import { View, Text, FlatList, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

interface PerspectiveRelationship {
  label: string;
  otherPersonName: string;
  type: string;
  status: "confirmed" | "pending";
}

interface PersonRelationshipsScreenProps {
  personName: string;
  relationships: PerspectiveRelationship[];
}

export function PersonRelationshipsScreen({
  personName,
  relationships,
}: PersonRelationshipsScreenProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        {personName}'s Relationships
      </Text>

      <FlatList
        data={relationships}
        keyExtractor={(_, index) => String(index)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.colors.background.card }]}>
            <Text style={[styles.otherName, { color: theme.colors.text.primary }]}>
              {item.otherPersonName}
            </Text>
            <Text style={[styles.label, { color: theme.colors.accent.primary }]}>
              {item.label}
            </Text>
            <Text style={[styles.type, { color: theme.colors.text.tertiary }]}>
              {item.type}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.colors.text.tertiary }]}>
            No relationships defined yet.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 20, paddingHorizontal: 8 },
  list: { gap: 8 },
  card: { borderRadius: 12, padding: 16, gap: 4 },
  otherName: { fontSize: 16, fontWeight: "600" },
  label: { fontSize: 15, fontWeight: "500" },
  type: { fontSize: 13, textTransform: "capitalize" },
  empty: { fontSize: 15, textAlign: "center", marginTop: 40 },
});
