import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useTheme } from "../../../shared/theme";

interface CommentItem {
  id: string;
  authorName: string;
  textContent: string;
  timeAgo: string;
}

interface CommentsScreenProps {
  postAuthorName: string;
  postTextPreview: string;
  comments: CommentItem[];
  onSubmitComment: (text: string) => void;
  onLoadMore: () => void;
}

export function CommentsScreen({
  postAuthorName,
  postTextPreview,
  comments,
  onSubmitComment,
  onLoadMore,
}: CommentsScreenProps) {
  const theme = useTheme();
  const [commentText, setCommentText] = useState("");

  const isValid = commentText.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={88}
    >
      <View style={[styles.postPreview, { backgroundColor: theme.colors.background.secondary }]}>
        <Text style={[styles.previewAuthor, { color: theme.colors.text.primary }]}>
          {postAuthorName}
        </Text>
        <Text
          style={[styles.previewText, { color: theme.colors.text.secondary }]}
          numberOfLines={2}
        >
          {postTextPreview}
        </Text>
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <View style={[styles.commentAvatar, { backgroundColor: theme.colors.accent.light }]}>
              <Text style={[styles.commentAvatarText, { color: theme.colors.accent.primary }]}>
                {item.authorName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.commentBody}>
              <View style={styles.commentHeader}>
                <Text style={[styles.commentAuthor, { color: theme.colors.text.primary }]}>
                  {item.authorName}
                </Text>
                <Text style={[styles.commentTime, { color: theme.colors.text.tertiary }]}>
                  {item.timeAgo}
                </Text>
              </View>
              <Text style={[styles.commentText, { color: theme.colors.text.primary }]}>
                {item.textContent}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.colors.text.tertiary }]}>
            No comments yet. Be the first!
          </Text>
        }
      />

      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: theme.colors.background.card,
            borderTopColor: theme.colors.border.primary,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: theme.colors.text.primary }]}
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Write a comment..."
          placeholderTextColor={theme.colors.text.tertiary}
          testID="comment-input"
        />
        <Pressable
          onPress={() => {
            if (isValid) {
              onSubmitComment(commentText.trim());
              setCommentText("");
            }
          }}
          disabled={!isValid}
          testID="submit-comment-button"
        >
          <Text
            style={[
              styles.sendText,
              { color: isValid ? theme.colors.accent.primary : theme.colors.text.tertiary },
            ]}
          >
            Send
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  postPreview: { padding: 14, gap: 4 },
  previewAuthor: { fontSize: 14, fontWeight: "600" },
  previewText: { fontSize: 14 },
  list: { padding: 16, gap: 16 },
  comment: { flexDirection: "row", gap: 10 },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  commentAvatarText: { fontSize: 14, fontWeight: "600" },
  commentBody: { flex: 1, gap: 2 },
  commentHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  commentAuthor: { fontSize: 14, fontWeight: "600" },
  commentTime: { fontSize: 12 },
  commentText: { fontSize: 15, lineHeight: 22 },
  empty: { textAlign: "center", marginTop: 32, fontSize: 14 },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 12,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 8 },
  sendText: { fontSize: 15, fontWeight: "600" },
});
