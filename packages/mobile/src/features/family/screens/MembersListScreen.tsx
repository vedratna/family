import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

interface MemberItem {
  personId: string;
  name: string;
  role: string;
  hasAppAccount: boolean;
}

interface MembersListScreenProps {
  familyName: string;
  members: MemberItem[];
  canManage: boolean;
  onMemberPress: (personId: string) => void;
  onInvitePress: () => void;
}

export function MembersListScreen({
  familyName,
  members,
  canManage,
  onMemberPress,
  onInvitePress,
}: MembersListScreenProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        {familyName} Members
      </Text>

      <FlatList
        data={members}
        keyExtractor={(item) => item.personId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.memberRow, { backgroundColor: theme.colors.background.card }]}
            onPress={() => {
              if (canManage) {
                onMemberPress(item.personId);
              }
            }}
            testID={`member-row-${item.personId}`}
          >
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: item.hasAppAccount
                    ? theme.colors.accent.light
                    : theme.colors.background.tertiary,
                },
              ]}
            >
              <Text style={[styles.avatarText, { color: theme.colors.accent.primary }]}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={[styles.memberName, { color: theme.colors.text.primary }]}>
                {item.name}
              </Text>
              <Text style={[styles.memberRole, { color: theme.colors.text.tertiary }]}>
                {item.role}
                {!item.hasAppAccount ? " \u00B7 Not on app" : ""}
              </Text>
            </View>
          </Pressable>
        )}
      />

      {canManage && (
        <Pressable
          style={[styles.inviteButton, { backgroundColor: theme.colors.accent.primary }]}
          onPress={onInvitePress}
          testID="invite-member-button"
        >
          <Text style={[styles.inviteButtonText, { color: theme.colors.accent.onColor }]}>
            Invite Member
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  list: {
    gap: 8,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    gap: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
  },
  memberRole: {
    fontSize: 13,
    textTransform: "capitalize",
  },
  inviteButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginVertical: 16,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
