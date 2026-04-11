import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";
import { IllustrationPlaceholder } from "../components/IllustrationPlaceholder";

interface InviteLandingScreenProps {
  inviterName: string;
  familyName: string;
  relationship: string;
  prefilledName: string;
  onJoin: (displayName: string) => void;
  onLogin: () => void;
}

export function InviteLandingScreen({
  inviterName,
  familyName,
  relationship,
  prefilledName,
  onJoin,
  onLogin,
}: InviteLandingScreenProps) {
  const theme = useTheme();
  const [displayName, setDisplayName] = useState(prefilledName);

  const isValid = displayName.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <IllustrationPlaceholder name="welcoming-wave" size={140} />

      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        {inviterName} invited you to
      </Text>
      <Text style={[styles.familyName, { color: theme.colors.accent.primary }]}>{familyName}!</Text>

      <Text style={[styles.relationship, { color: theme.colors.text.secondary }]}>
        You're joining as: {inviterName}'s {relationship}
      </Text>

      <Text style={[styles.label, { color: theme.colors.text.primary }]}>Your name</Text>
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.text.primary,
            borderColor: theme.colors.border.primary,
            backgroundColor: theme.colors.background.card,
          },
        ]}
        value={displayName}
        onChangeText={setDisplayName}
        testID="invitee-name-input"
      />

      <Pressable
        style={[
          styles.button,
          {
            backgroundColor: isValid
              ? theme.colors.accent.primary
              : theme.colors.background.tertiary,
          },
        ]}
        onPress={() => {
          if (isValid) {
            onJoin(displayName.trim());
          }
        }}
        disabled={!isValid}
        testID="join-family-button"
      >
        <Text
          style={[
            styles.buttonText,
            { color: isValid ? theme.colors.accent.onColor : theme.colors.text.tertiary },
          ]}
        >
          Join Family
        </Text>
      </Pressable>

      <Text style={[styles.loginLink, { color: theme.colors.text.secondary }]} onPress={onLogin}>
        Already on FamilyApp? <Text style={{ color: theme.colors.accent.primary }}>Log in</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    marginTop: 24,
  },
  familyName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  relationship: {
    fontSize: 15,
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    width: "100%",
  },
  button: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loginLink: {
    fontSize: 14,
    marginTop: 16,
  },
});
