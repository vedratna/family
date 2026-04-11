import { View, Text, Pressable, StyleSheet, Modal } from "react-native";

import { useTheme } from "../../../shared/theme";

interface PersonProfileCardProps {
  visible: boolean;
  name: string;
  relationshipToViewer?: string;
  hasAppAccount: boolean;
  onViewPosts: () => void;
  onViewRelationships: () => void;
  onClose: () => void;
}

export function PersonProfileCard({
  visible,
  name,
  relationshipToViewer,
  hasAppAccount,
  onViewPosts,
  onViewRelationships,
  onClose,
}: PersonProfileCardProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" testID="person-profile-modal">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.colors.background.card }]}>
          <View
            style={[styles.avatar, { backgroundColor: theme.colors.accent.light }]}
          >
            <Text style={[styles.avatarText, { color: theme.colors.accent.primary }]}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={[styles.name, { color: theme.colors.text.primary }]}>{name}</Text>

          {relationshipToViewer !== undefined && (
            <Text style={[styles.relationship, { color: theme.colors.accent.primary }]}>
              Your {relationshipToViewer}
            </Text>
          )}

          {!hasAppAccount && (
            <Text style={[styles.notOnApp, { color: theme.colors.text.tertiary }]}>
              Not on the app
            </Text>
          )}

          <View style={styles.actions}>
            {hasAppAccount && (
              <Pressable
                style={[styles.actionButton, { backgroundColor: theme.colors.accent.primary }]}
                onPress={onViewPosts}
                testID="view-posts-button"
              >
                <Text style={[styles.actionText, { color: theme.colors.accent.onColor }]}>
                  View Posts
                </Text>
              </Pressable>
            )}

            <Pressable
              style={[styles.actionButton, { borderColor: theme.colors.accent.primary, borderWidth: 1, backgroundColor: "transparent" }]}
              onPress={onViewRelationships}
              testID="view-relationships-button"
            >
              <Text style={[styles.actionText, { color: theme.colors.accent.primary }]}>
                Relationships
              </Text>
            </Pressable>
          </View>

          <Pressable onPress={onClose} testID="close-profile-button">
            <Text style={[styles.close, { color: theme.colors.text.tertiary }]}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  card: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "600",
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
  },
  relationship: {
    fontSize: 15,
    fontWeight: "500",
  },
  notOnApp: {
    fontSize: 13,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  close: {
    fontSize: 14,
    marginTop: 12,
  },
});
