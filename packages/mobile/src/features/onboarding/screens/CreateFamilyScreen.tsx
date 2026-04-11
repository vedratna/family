import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

import { useTheme, themes, type ThemeName } from "../../../shared/theme";
import { IllustrationPlaceholder } from "../components/IllustrationPlaceholder";
import { ThemeColorPicker } from "../components/ThemeColorPicker";

interface CreateFamilyScreenProps {
  onSubmit: (data: { name: string; themeName: ThemeName }) => void;
}

export function CreateFamilyScreen({ onSubmit }: CreateFamilyScreenProps) {
  const theme = useTheme();
  const [familyName, setFamilyName] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>("teal");

  const isValid = familyName.trim().length > 0;
  const previewAccent = themes[selectedTheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <IllustrationPlaceholder name="family-group" size={140} />

      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        Let's create your family space!
      </Text>

      <Text style={[styles.label, { color: theme.colors.text.primary }]}>Family name</Text>
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.text.primary,
            borderColor: theme.colors.border.primary,
            backgroundColor: theme.colors.background.card,
          },
        ]}
        value={familyName}
        onChangeText={setFamilyName}
        placeholder="The Sharma Family"
        placeholderTextColor={theme.colors.text.tertiary}
        testID="family-name-input"
      />

      <Text style={[styles.label, { color: theme.colors.text.primary }]}>
        Pick a color for your family
      </Text>
      <ThemeColorPicker selected={selectedTheme} onSelect={setSelectedTheme} />

      {/* Live preview */}
      <View style={[styles.preview, { backgroundColor: previewAccent.primary }]}>
        <Text style={[styles.previewText, { color: previewAccent.onColor }]}>
          {familyName.trim().length > 0 ? familyName.trim() : "Your Family"}
        </Text>
      </View>

      <Pressable
        style={[
          styles.button,
          {
            backgroundColor: isValid
              ? previewAccent.primary
              : theme.colors.background.tertiary,
          },
        ]}
        onPress={() => {
          if (isValid) {
            onSubmit({ name: familyName.trim(), themeName: selectedTheme });
          }
        }}
        disabled={!isValid}
        testID="create-family-button"
      >
        <Text
          style={[
            styles.buttonText,
            { color: isValid ? previewAccent.onColor : theme.colors.text.tertiary },
          ]}
        >
          Create Family
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
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    lineHeight: 32,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 24,
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
  preview: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  previewText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
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
});
