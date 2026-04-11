import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";
import { IllustrationPlaceholder } from "../components/IllustrationPlaceholder";

interface ProfileSetupScreenProps {
  onSubmit: (profile: { displayName: string; dateOfBirth?: string }) => void;
}

export function ProfileSetupScreen({ onSubmit }: ProfileSetupScreenProps) {
  const theme = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const isValid = displayName.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={styles.avatarSection}>
        <IllustrationPlaceholder name="default-avatar" size={96} />
      </View>

      <Text style={[styles.label, { color: theme.colors.text.primary }]}>
        What should your family call you?
      </Text>

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
        placeholder="Your name"
        placeholderTextColor={theme.colors.text.tertiary}
        autoFocus
        testID="display-name-input"
      />

      <Text style={[styles.label, { color: theme.colors.text.primary }]}>
        Date of birth (optional)
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.text.primary,
            borderColor: theme.colors.border.primary,
            backgroundColor: theme.colors.background.card,
          },
        ]}
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
        placeholder="DD/MM/YYYY"
        placeholderTextColor={theme.colors.text.tertiary}
        keyboardType="number-pad"
        testID="dob-input"
      />

      <Text style={[styles.hint, { color: theme.colors.accent.primary }]}>
        Helps us remind your family!
      </Text>

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
            onSubmit({
              displayName: displayName.trim(),
              ...(dateOfBirth.length > 0 ? { dateOfBirth } : {}),
            });
          }
        }}
        disabled={!isValid}
        testID="continue-button"
      >
        <Text
          style={[
            styles.buttonText,
            { color: isValid ? theme.colors.accent.onColor : theme.colors.text.tertiary },
          ]}
        >
          Continue
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
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  hint: {
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 32,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
