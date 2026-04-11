import { View, Text, FlatList, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

interface AgendaEvent {
  id: string;
  title: string;
  eventType: string;
  startDate: string;
  startTime?: string;
  location?: string;
}

interface AgendaSection {
  date: string;
  dateLabel: string;
  events: AgendaEvent[];
}

interface AgendaScreenProps {
  sections: AgendaSection[];
  onEventPress: (eventId: string) => void;
  onSwitchToMonth: () => void;
}

export function AgendaScreen({ sections, onEventPress: _onEventPress, onSwitchToMonth: _onSwitchToMonth }: AgendaScreenProps) {
  const theme = useTheme();

  const flatItems = sections.flatMap((section) => [
    { type: "header" as const, date: section.date, dateLabel: section.dateLabel },
    ...section.events.map((event) => ({ type: "event" as const, ...event })),
  ]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <FlatList
        data={flatItems}
        keyExtractor={(item, _index) => item.type === "header" ? `header-${item.date}` : `event-${item.id}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          if (item.type === "header") {
            return (
              <Text style={[styles.dateHeader, { color: theme.colors.text.primary }]}>
                {item.dateLabel}
              </Text>
            );
          }

          const emoji = item.eventType === "birthday" ? "\uD83C\uDF82"
            : item.eventType === "marriage" || item.eventType === "anniversary" ? "\uD83D\uDC8D"
            : "\uD83D\uDCC5";

          return (
            <View
              style={[styles.eventCard, { backgroundColor: theme.colors.background.card }]}
              testID={`agenda-event-${item.id}`}
            >
              <Text style={styles.emoji}>{emoji}</Text>
              <View style={styles.eventInfo}>
                <Text style={[styles.eventTitle, { color: theme.colors.text.primary }]}>
                  {item.title}
                </Text>
                <Text style={[styles.eventMeta, { color: theme.colors.text.secondary }]}>
                  {[item.startTime, item.location].filter(Boolean).join(" \u00B7 ") || item.eventType}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.colors.text.tertiary }]}>
            No upcoming events.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 8 },
  dateHeader: { fontSize: 16, fontWeight: "600", marginTop: 12, marginBottom: 4 },
  eventCard: { flexDirection: "row", borderRadius: 10, padding: 14, gap: 12, alignItems: "center" },
  emoji: { fontSize: 22 },
  eventInfo: { flex: 1, gap: 2 },
  eventTitle: { fontSize: 15, fontWeight: "500" },
  eventMeta: { fontSize: 13 },
  empty: { textAlign: "center", marginTop: 40, fontSize: 15 },
});
