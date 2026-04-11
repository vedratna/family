import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Modal } from "react-native";

import { useTheme } from "../../../shared/theme";

const TOUR_STEPS = [
  {
    title: "Family Feed",
    description: "Posts, photos, and updates from your family show up here.",
    highlight: "Feed",
  },
  {
    title: "Calendar & Tree",
    description:
      "Calendar shows family events and birthdays. Tree shows how everyone is connected — it builds itself as relationships are added!",
    highlight: "Calendar + Tree",
  },
  {
    title: "Notifications",
    description:
      "You'll get notified for upcoming family events. You can customize what you get notified about in Settings.",
    highlight: "Notifications",
  },
] as const;

interface MiniTourProps {
  visible: boolean;
  onComplete: () => void;
}

export function MiniTour({ visible, onComplete }: MiniTourProps) {
  const theme = useTheme();
  const [stepIndex, setStepIndex] = useState(0);

  const step = TOUR_STEPS[stepIndex];
  if (step === undefined) {
    return null;
  }

  const isLastStep = stepIndex === TOUR_STEPS.length - 1;

  function handleNext() {
    if (isLastStep) {
      onComplete();
      return;
    }
    setStepIndex((prev) => prev + 1);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" testID="mini-tour-modal">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.colors.background.card }]}>
          <Text style={[styles.stepIndicator, { color: theme.colors.text.tertiary }]}>
            {String(stepIndex + 1)} of {String(TOUR_STEPS.length)}
          </Text>

          <Text style={[styles.title, { color: theme.colors.text.primary }]}>{step.title}</Text>

          <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
            {step.description}
          </Text>

          <View style={styles.actions}>
            <Pressable
              style={[styles.nextButton, { backgroundColor: theme.colors.accent.primary }]}
              onPress={handleNext}
              testID="tour-next-button"
            >
              <Text style={[styles.nextButtonText, { color: theme.colors.accent.onColor }]}>
                {isLastStep ? "Got it!" : "Next"}
              </Text>
            </Pressable>

            {!isLastStep && (
              <Text
                style={[styles.skipText, { color: theme.colors.text.tertiary }]}
                onPress={onComplete}
                testID="tour-skip-button"
              >
                Skip tour
              </Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
  },
  stepIndicator: {
    fontSize: 13,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  actions: {
    alignItems: "center",
    gap: 12,
  },
  nextButton: {
    width: "100%",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  skipText: {
    fontSize: 14,
  },
});
