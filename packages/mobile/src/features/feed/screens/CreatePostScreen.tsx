import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

interface CreatePostScreenProps {
  onSubmit: (data: { textContent: string; mediaKeys: string[] }) => void;
  onPickMedia: () => void;
  selectedMediaCount: number;
}

export function CreatePostScreen({
  onSubmit,
  onPickMedia,
  selectedMediaCount,
}: CreatePostScreenProps) {
  const theme = useTheme();
  const [textContent, setTextContent] = useState("");

  const isValid = textContent.trim().length > 0 || selectedMediaCount > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.text.primary,
            backgroundColor: theme.colors.background.card,
          },
        ]}
        value={textContent}
        onChangeText={setTextContent}
        placeholder="What's happening?"
        placeholderTextColor={theme.colors.text.tertiary}
        multiline
        autoFocus
        testID="post-text-input"
      />

      <View style={styles.toolbar}>
        <Pressable
          style={[styles.mediaButton, { borderColor: theme.colors.border.primary }]}
          onPress={onPickMedia}
          testID="pick-media-button"
        >
          <Text style={[styles.mediaButtonText, { color: theme.colors.accent.primary }]}>
            {"\uD83D\uDCF7"} {selectedMediaCount > 0 ? `${String(selectedMediaCount)} selected` : "Add Photo/Video"}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.postButton,
            {
              backgroundColor: isValid
                ? theme.colors.accent.primary
                : theme.colors.background.tertiary,
            },
          ]}
          onPress={() => {
            if (isValid) {
              onSubmit({ textContent: textContent.trim(), mediaKeys: [] });
            }
          }}
          disabled={!isValid}
          testID="submit-post-button"
        >
          <Text
            style={[
              styles.postButtonText,
              { color: isValid ? theme.colors.accent.onColor : theme.colors.text.tertiary },
            ]}
          >
            Post
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    flex: 1,
    fontSize: 18,
    lineHeight: 26,
    textAlignVertical: "top",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mediaButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  mediaButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  postButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
