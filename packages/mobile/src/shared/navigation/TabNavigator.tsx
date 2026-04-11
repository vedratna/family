import { View, Text, Pressable, StyleSheet } from "react-native";

import { useTheme } from "../theme";

const TABS = [
  { key: "feed", label: "Feed", icon: "\uD83C\uDFE0" },
  { key: "calendar", label: "Calendar", icon: "\uD83D\uDCC5" },
  { key: "tree", label: "Tree", icon: "\uD83C\uDF33" },
  { key: "chores", label: "Chores", icon: "\u2705" },
  { key: "more", label: "More", icon: "\u22EF" },
] as const;

export type TabKey = (typeof TABS)[number]["key"];

interface TabNavigatorProps {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
}

export function TabNavigator({ activeTab, onTabPress }: TabNavigatorProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.card, borderTopColor: theme.colors.border.secondary }]}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={styles.tab}
            onPress={() => { onTabPress(tab.key); }}
            testID={`tab-${tab.key}`}
          >
            <Text style={styles.icon}>{tab.icon}</Text>
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? theme.colors.accent.primary : theme.colors.text.tertiary,
                  fontWeight: isActive ? "600" : "400",
                },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingBottom: 24,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    paddingVertical: 4,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 11,
  },
});
