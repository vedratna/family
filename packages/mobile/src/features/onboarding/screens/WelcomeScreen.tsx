import { View, Text, Pressable, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";
import { SocialLoginButtons } from "../../auth/components/SocialLoginButtons";
import { IllustrationPlaceholder } from "../components/IllustrationPlaceholder";

interface WelcomeScreenProps {
  onPhonePress: () => void;
  onGooglePress: () => void;
  onApplePress: () => void;
  onLoginPress: () => void;
}

export function WelcomeScreen({
  onPhonePress,
  onGooglePress,
  onApplePress,
  onLoginPress,
}: WelcomeScreenProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={styles.heroSection}>
        <IllustrationPlaceholder name="family-welcome" size={200} />

        <Text style={[styles.tagline, { color: theme.colors.text.primary }]}>
          Your family's private space.
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          Share moments. Plan together. Stay connected.
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.primaryButton, { backgroundColor: theme.colors.accent.primary }]}
          onPress={onPhonePress}
          testID="phone-signup-button"
        >
          <Text style={[styles.primaryButtonText, { color: theme.colors.accent.onColor }]}>
            Continue with Phone
          </Text>
        </Pressable>

        <SocialLoginButtons onGooglePress={onGooglePress} onApplePress={onApplePress} />

        <Text
          style={[styles.loginLink, { color: theme.colors.text.secondary }]}
          onPress={onLoginPress}
          testID="login-link"
        >
          Already have an account?{" "}
          <Text style={{ color: theme.colors.accent.primary }}>Log in</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingTop: 80,
    paddingBottom: 48,
  },
  heroSection: {
    alignItems: "center",
    gap: 12,
  },
  tagline: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 36,
    textAlign: "center",
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loginLink: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});
