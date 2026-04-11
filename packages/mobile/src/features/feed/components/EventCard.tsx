import { View, Text, Pressable, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

interface EventCardProps {
  title: string;
  date: string;
  daysAway: number;
  eventType: string;
  onPress: () => void;
}

export function EventCard({ title, date, daysAway, eventType, onPress }: EventCardProps) {
  const theme = useTheme();

  const emoji = eventType === "birthday" ? "\uD83C\uDF82" : "\uD83D\uDCC5";
  const daysText = daysAway === 0 ? "Today!" : daysAway === 1 ? "Tomorrow" : `${String(daysAway)} days away`;

  return (
    <Pressable
      style={[styles.card, { backgroundColor: theme.colors.accent.light }]}
      onPress={onPress}
      testID="event-card"
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>{title}</Text>
        <Text style={[styles.date, { color: theme.colors.text.secondary }]}>
          {date} {"\u00B7"} {daysText}
        </Text>
      </View>
      <Text style={[styles.rsvp, { color: theme.colors.accent.primary }]}>RSVP {"\u2192"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  emoji: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  date: {
    fontSize: 13,
  },
  rsvp: {
    fontSize: 13,
    fontWeight: "600",
  },
});
