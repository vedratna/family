import { Pressable, Text, View, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

interface TreeNodeCardProps {
  name: string;
  hasAppAccount: boolean;
  isHighlighted?: boolean;
  onPress: () => void;
}

export function TreeNodeCard({
  name,
  hasAppAccount,
  isHighlighted = false,
  onPress,
}: TreeNodeCardProps) {
  const theme = useTheme();

  const backgroundColor = hasAppAccount
    ? theme.colors.background.card
    : theme.colors.background.tertiary;

  const borderColor = isHighlighted ? theme.colors.accent.primary : theme.colors.border.primary;

  return (
    <Pressable
      style={[styles.card, { backgroundColor, borderColor, borderWidth: isHighlighted ? 2 : 1 }]}
      onPress={onPress}
      testID={`tree-node-${name}`}
    >
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: hasAppAccount
              ? theme.colors.accent.light
              : theme.colors.background.secondary,
          },
        ]}
      >
        <Text
          style={[
            styles.avatarText,
            {
              color: hasAppAccount ? theme.colors.accent.primary : theme.colors.text.tertiary,
            },
          ]}
        >
          {name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text
        style={[
          styles.name,
          {
            color: hasAppAccount ? theme.colors.text.primary : theme.colors.text.tertiary,
          },
        ]}
        numberOfLines={1}
      >
        {name}
      </Text>
      {!hasAppAccount && (
        <Text style={[styles.badge, { color: theme.colors.text.tertiary }]}>Not on app</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderRadius: 12,
    padding: 10,
    width: 90,
    gap: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
  },
  name: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  badge: {
    fontSize: 9,
    fontStyle: "italic",
  },
});
