import { View, Text, Pressable, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

const QUICK_REACTIONS = ["\u2764\uFE0F", "\uD83D\uDC4D", "\uD83D\uDE02", "\uD83D\uDE0D", "\uD83D\uDE22", "\uD83D\uDE4F"];

interface ReactionSummary {
  emoji: string;
  count: number;
  isOwnReaction: boolean;
}

interface ReactionsBarProps {
  reactions: ReactionSummary[];
  onToggleReaction: (emoji: string) => void;
  showPicker?: boolean;
}

export function ReactionsBar({ reactions, onToggleReaction, showPicker = false }: ReactionsBarProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {reactions.map((reaction) => (
        <Pressable
          key={reaction.emoji}
          style={[
            styles.reactionChip,
            {
              backgroundColor: reaction.isOwnReaction
                ? theme.colors.accent.light
                : theme.colors.background.secondary,
              borderColor: reaction.isOwnReaction
                ? theme.colors.accent.primary
                : "transparent",
            },
          ]}
          onPress={() => {
            onToggleReaction(reaction.emoji);
          }}
          testID={`reaction-${reaction.emoji}`}
        >
          <Text style={styles.emoji}>{reaction.emoji}</Text>
          <Text
            style={[
              styles.count,
              { color: reaction.isOwnReaction ? theme.colors.accent.primary : theme.colors.text.secondary },
            ]}
          >
            {String(reaction.count)}
          </Text>
        </Pressable>
      ))}

      {showPicker && (
        <View style={styles.picker}>
          {QUICK_REACTIONS.map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => {
                onToggleReaction(emoji);
              }}
              testID={`pick-reaction-${emoji}`}
            >
              <Text style={styles.pickerEmoji}>{emoji}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  reactionChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
  },
  emoji: {
    fontSize: 14,
  },
  count: {
    fontSize: 13,
    fontWeight: "500",
  },
  picker: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 8,
  },
  pickerEmoji: {
    fontSize: 20,
  },
});
