import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";

import { useTheme, themes, type ThemeName } from "../../../shared/theme";

interface FamilyItem {
  id: string;
  name: string;
  themeName: ThemeName;
  role: string;
  isActive: boolean;
}

interface FamilySwitcherScreenProps {
  families: FamilyItem[];
  onSelectFamily: (familyId: string) => void;
  onCreateFamily: () => void;
}

export function FamilySwitcherScreen({
  families,
  onSelectFamily,
  onCreateFamily,
}: FamilySwitcherScreenProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Text style={[styles.greeting, { color: theme.colors.text.primary }]}>Your Families</Text>

      <FlatList
        data={families}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const accent = themes[item.themeName];
          return (
            <Pressable
              style={[
                styles.familyCard,
                {
                  backgroundColor: theme.colors.background.card,
                  borderLeftColor: accent.primary,
                  borderLeftWidth: 4,
                },
              ]}
              onPress={() => {
                onSelectFamily(item.id);
              }}
              testID={`family-card-${item.id}`}
            >
              <Text style={[styles.familyName, { color: theme.colors.text.primary }]}>
                {item.name}
              </Text>
              <Text style={[styles.role, { color: theme.colors.text.tertiary }]}>{item.role}</Text>
              {item.isActive && (
                <View style={[styles.activeBadge, { backgroundColor: accent.light }]}>
                  <Text style={[styles.activeBadgeText, { color: accent.primary }]}>Active</Text>
                </View>
              )}
            </Pressable>
          );
        }}
      />

      <Pressable
        style={[styles.createButton, { borderColor: theme.colors.border.primary }]}
        onPress={onCreateFamily}
        testID="create-family-button"
      >
        <Text style={[styles.createButtonText, { color: theme.colors.accent.primary }]}>
          + Create Family
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
  },
  list: {
    gap: 12,
  },
  familyCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  familyName: {
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
  },
  role: {
    fontSize: 13,
    textTransform: "capitalize",
  },
  activeBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  createButton: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
