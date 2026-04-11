import type { Role } from "@family-app/shared";
import { View, Text, Pressable, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

interface ManageMemberScreenProps {
  memberName: string;
  currentRole: Role;
  isOwner: boolean;
  onChangeRole: (role: Role) => void;
  onRemove: () => void;
  onTransferOwnership: () => void;
}

const ASSIGNABLE_ROLES: { role: Role; label: string }[] = [
  { role: "admin", label: "Admin" },
  { role: "editor", label: "Editor" },
  { role: "viewer", label: "Viewer" },
];

export function ManageMemberScreen({
  memberName,
  currentRole,
  isOwner,
  onChangeRole,
  onRemove,
  onTransferOwnership,
}: ManageMemberScreenProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        Manage {memberName}
      </Text>

      <Text style={[styles.sectionLabel, { color: theme.colors.text.secondary }]}>Role</Text>

      {ASSIGNABLE_ROLES.map(({ role, label }) => (
        <Pressable
          key={role}
          style={[
            styles.roleOption,
            {
              backgroundColor:
                currentRole === role ? theme.colors.accent.light : theme.colors.background.card,
              borderColor:
                currentRole === role ? theme.colors.accent.primary : theme.colors.border.primary,
            },
          ]}
          onPress={() => {
            onChangeRole(role);
          }}
          testID={`role-option-${role}`}
        >
          <Text
            style={[
              styles.roleLabel,
              {
                color:
                  currentRole === role ? theme.colors.accent.primary : theme.colors.text.primary,
              },
            ]}
          >
            {label}
          </Text>
        </Pressable>
      ))}

      {isOwner && (
        <Pressable
          style={[styles.actionButton, { borderColor: theme.colors.accent.primary }]}
          onPress={onTransferOwnership}
          testID="transfer-ownership-button"
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.accent.primary }]}>
            Transfer Ownership
          </Text>
        </Pressable>
      )}

      <Pressable
        style={[styles.actionButton, { borderColor: theme.colors.semantic.error }]}
        onPress={onRemove}
        testID="remove-member-button"
      >
        <Text style={[styles.actionButtonText, { color: theme.colors.semantic.error }]}>
          Remove from Family
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  roleOption: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  actionButton: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
