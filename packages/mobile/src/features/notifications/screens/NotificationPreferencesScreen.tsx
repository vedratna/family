import { View, Text, Switch, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

interface PreferenceItem {
  category: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface PreferenceGroup {
  title: string;
  items: PreferenceItem[];
}

interface NotificationPreferencesScreenProps {
  groups: PreferenceGroup[];
  onToggle: (category: string, enabled: boolean) => void;
}

export function NotificationPreferencesScreen({
  groups,
  onToggle,
}: NotificationPreferencesScreenProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>Notifications</Text>
      <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
        Choose what you get notified about in this family.
      </Text>

      {groups.map((group) => (
        <View key={group.title} style={styles.group}>
          <Text style={[styles.groupTitle, { color: theme.colors.text.primary }]}>
            {group.title}
          </Text>
          {group.items.map((item) => (
            <View
              key={item.category}
              style={[styles.row, { borderBottomColor: theme.colors.border.secondary }]}
            >
              <View style={styles.rowText}>
                <Text style={[styles.rowLabel, { color: theme.colors.text.primary }]}>
                  {item.label}
                </Text>
                <Text style={[styles.rowDescription, { color: theme.colors.text.tertiary }]}>
                  {item.description}
                </Text>
              </View>
              <Switch
                value={item.enabled}
                onValueChange={(value) => {
                  onToggle(item.category, value);
                }}
                trackColor={{
                  false: theme.colors.background.tertiary,
                  true: theme.colors.accent.primary,
                }}
                testID={`toggle-${item.category}`}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 24 },
  group: { marginBottom: 24 },
  groupTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rowText: { flex: 1, marginRight: 16 },
  rowLabel: { fontSize: 16, fontWeight: "500" },
  rowDescription: { fontSize: 13, marginTop: 2 },
});
