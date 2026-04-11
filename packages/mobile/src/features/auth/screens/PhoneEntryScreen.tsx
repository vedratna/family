import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

interface PhoneEntryScreenProps {
  onSubmit: (phone: string) => void;
}

export function PhoneEntryScreen({ onSubmit }: PhoneEntryScreenProps) {
  const theme = useTheme();
  const [phone, setPhone] = useState("");

  const isValid = phone.length >= 10;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        What's your phone number?
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
        value={phone}
        onChangeText={setPhone}
        placeholder="+91 98765 43210"
        placeholderTextColor={theme.colors.text.tertiary}
        keyboardType="phone-pad"
        autoFocus
        testID="phone-input"
      />

      <Text style={[styles.hint, { color: theme.colors.text.secondary }]}>
        We'll send you a verification code. No spam, ever.
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
            onSubmit(phone);
          }
        }}
        disabled={!isValid}
        testID="send-code-button"
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: isValid ? theme.colors.accent.onColor : theme.colors.text.tertiary,
            },
          ]}
        >
          Send Code
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 36,
    marginBottom: 32,
  },
  input: {
    fontSize: 18,
    fontWeight: "500",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
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
