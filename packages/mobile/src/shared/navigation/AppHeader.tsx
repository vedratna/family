import { View, Text, Pressable, StyleSheet } from "react-native";

import { useTheme } from "../theme";

interface AppHeaderProps {
  familyName: string;
  showInviteButton: boolean;
  onFamilySwitcher: () => void;
  onNotifications: () => void;
  onInvite: () => void;
}

export function AppHeader({
  familyName,
  showInviteButton,
  onFamilySwitcher,
  onNotifications,
  onInvite,
}: AppHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.accent.primary }]}>
      <Pressable onPress={onFamilySwitcher} testID="family-switcher-button">
        <Text style={[styles.familyName, { color: theme.colors.accent.onColor }]}>
          {familyName}
        </Text>
      </Pressable>

      <View style={styles.actions}>
        {showInviteButton && (
          <Pressable
            style={[styles.inviteButton, { backgroundColor: "rgba(255,255,255,0.2)" }]}
            onPress={onInvite}
            testID="header-invite-button"
          >
            <Text style={[styles.inviteText, { color: theme.colors.accent.onColor }]}>
              Invite Family
            </Text>
          </Pressable>
        )}

        <Pressable onPress={onNotifications} testID="notifications-button">
          <Text style={[styles.bellIcon, { color: theme.colors.accent.onColor }]}>
            {"\uD83D\uDD14"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  familyName: {
    fontSize: 18,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  inviteButton: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  inviteText: {
    fontSize: 13,
    fontWeight: "600",
  },
  bellIcon: {
    fontSize: 20,
  },
});
