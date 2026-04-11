import { View, Text, Pressable, Image, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

interface PostCardProps {
  authorName: string;
  textContent: string;
  timeAgo: string;
  mediaUrls: string[];
  reactionCount: number;
  commentCount: number;
  onReact: () => void;
  onComment: () => void;
  onShare: () => void;
  onPress: () => void;
}

export function PostCard({
  authorName,
  textContent,
  timeAgo,
  mediaUrls,
  reactionCount,
  commentCount,
  onReact,
  onComment,
  onShare,
  onPress,
}: PostCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      style={[styles.card, { backgroundColor: theme.colors.background.card }]}
      onPress={onPress}
      testID="post-card"
    >
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.accent.light }]}>
          <Text style={[styles.avatarText, { color: theme.colors.accent.primary }]}>
            {authorName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.authorName, { color: theme.colors.text.primary }]}>
            {authorName}
          </Text>
          <Text style={[styles.timeAgo, { color: theme.colors.text.tertiary }]}>{timeAgo}</Text>
        </View>
      </View>

      <Text style={[styles.content, { color: theme.colors.text.primary }]}>{textContent}</Text>

      {mediaUrls.length > 0 && (
        <View style={styles.mediaContainer}>
          {mediaUrls.slice(0, 4).map((url, index) => (
            <Image
              key={index}
              source={{ uri: url }}
              style={styles.mediaImage}
              testID={`post-media-${String(index)}`}
            />
          ))}
        </View>
      )}

      <View style={[styles.actions, { borderTopColor: theme.colors.border.secondary }]}>
        <Pressable style={styles.actionButton} onPress={onReact} testID="react-button">
          <Text style={[styles.actionText, { color: theme.colors.text.secondary }]}>
            {reactionCount > 0 ? `\u2764\uFE0F ${String(reactionCount)}` : "\u2764\uFE0F"}
          </Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={onComment} testID="comment-button">
          <Text style={[styles.actionText, { color: theme.colors.text.secondary }]}>
            {commentCount > 0 ? `\uD83D\uDCAC ${String(commentCount)}` : "\uD83D\uDCAC"}
          </Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={onShare} testID="share-button">
          <Text style={[styles.actionText, { color: theme.colors.text.secondary }]}>
            {"\u2197\uFE0F"} Share
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerText: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: "600",
  },
  timeAgo: {
    fontSize: 13,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
  mediaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  mediaImage: {
    flex: 1,
    minWidth: "48%",
    aspectRatio: 1,
    borderRadius: 8,
  },
  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    fontSize: 14,
  },
});
