import { View, Text, Pressable, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

import { IllustrationPlaceholder } from "./IllustrationPlaceholder";

interface PendingInvite {
  name: string;
  status: "pending" | "sent";
}

interface LockedFeedStateProps {
  pendingInvites: PendingInvite[];
  onInviteMore: () => void;
  onAddEvent: () => void;
  onAddToTree: () => void;
}

export function LockedFeedState({
  pendingInvites,
  onInviteMore,
  onAddEvent,
  onAddToTree,
}: LockedFeedStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: theme.colors.background.card }]}>
        <IllustrationPlaceholder name="person-waiting" size={120} />

        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Waiting for your family to join!
        </Text>

        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          Once a member joins, you can start sharing moments together.
        </Text>

        <Pressable
          style={[styles.inviteButton, { backgroundColor: theme.colors.accent.primary }]}
          onPress={onInviteMore}
          testID="locked-invite-button"
        >
          <Text style={[styles.inviteButtonText, { color: theme.colors.accent.onColor }]}>
            Invite More Family
          </Text>
        </Pressable>

        {pendingInvites.length > 0 && (
          <View style={styles.invitesList}>
            {pendingInvites.map((invite) => (
              <Text
                key={invite.name}
                style={[styles.inviteItem, { color: theme.colors.text.secondary }]}
              >
                {invite.name} — invite {invite.status}
              </Text>
            ))}
          </View>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.background.card }]}>
        <Text style={[styles.whileYouWait, { color: theme.colors.text.primary }]}>
          While you wait...
        </Text>
        <Pressable onPress={onAddEvent} testID="add-event-suggestion">
          <Text style={[styles.suggestion, { color: theme.colors.accent.primary }]}>
            Add a family event
          </Text>
        </Pressable>
        <Pressable onPress={onAddToTree} testID="add-to-tree-suggestion">
          <Text style={[styles.suggestion, { color: theme.colors.accent.primary }]}>
            Add family members to the tree (no app needed)
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  inviteButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  inviteButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  invitesList: {
    marginTop: 8,
    gap: 4,
  },
  inviteItem: {
    fontSize: 14,
  },
  whileYouWait: {
    fontSize: 16,
    fontWeight: "600",
    alignSelf: "flex-start",
  },
  suggestion: {
    fontSize: 15,
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
});
