import { View, Text, Pressable, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

interface SocialLoginButtonsProps {
  onGooglePress: () => void;
  onApplePress: () => void;
}

export function SocialLoginButtons({ onGooglePress, onApplePress }: SocialLoginButtonsProps) {
  const theme = useTheme();

  const outlineStyle = {
    borderColor: theme.colors.border.primary,
    backgroundColor: theme.colors.background.card,
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, outlineStyle]}
        onPress={onGooglePress}
        testID="google-login-button"
      >
        <Text style={[styles.buttonText, { color: theme.colors.text.primary }]}>
          Continue with Google
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, outlineStyle]}
        onPress={onApplePress}
        testID="apple-login-button"
      >
        <Text style={[styles.buttonText, { color: theme.colors.text.primary }]}>
          Continue with Apple
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  button: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
