import { View, Text, Pressable, StyleSheet, type DimensionValue } from "react-native";

import { useTheme } from "../../../shared/theme";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

interface DayData {
  date: number;
  isCurrentMonth: boolean;
  hasEvents: boolean;
  isToday: boolean;
}

interface CalendarMonthScreenProps {
  year: number;
  month: number;
  days: DayData[];
  onDayPress: (date: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSwitchToAgenda: () => void;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function CalendarMonthScreen({
  year,
  month,
  days,
  onDayPress,
  onPrevMonth,
  onNextMonth,
  onSwitchToAgenda,
}: CalendarMonthScreenProps) {
  const theme = useTheme();
  const monthName = MONTH_NAMES[month];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={styles.header}>
        <Pressable onPress={onPrevMonth} testID="prev-month">
          <Text style={[styles.navArrow, { color: theme.colors.accent.primary }]}>{"\u2039"}</Text>
        </Pressable>
        <Text style={[styles.monthTitle, { color: theme.colors.text.primary }]}>
          {monthName} {String(year)}
        </Text>
        <Pressable onPress={onNextMonth} testID="next-month">
          <Text style={[styles.navArrow, { color: theme.colors.accent.primary }]}>{"\u203A"}</Text>
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day) => (
          <Text key={day} style={[styles.weekday, { color: theme.colors.text.tertiary }]}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {days.map((day, index) => (
          <Pressable
            key={index}
            style={[
              styles.dayCell,
              day.isToday
                ? { backgroundColor: theme.colors.accent.primary, borderRadius: 20 }
                : undefined,
            ]}
            onPress={() => {
              if (day.isCurrentMonth) {
                onDayPress(day.date);
              }
            }}
            testID={day.isCurrentMonth ? `day-${String(day.date)}` : undefined}
          >
            <Text
              style={[
                styles.dayText,
                {
                  color: day.isToday
                    ? theme.colors.accent.onColor
                    : day.isCurrentMonth
                      ? theme.colors.text.primary
                      : theme.colors.text.tertiary,
                },
              ]}
            >
              {String(day.date)}
            </Text>
            {day.hasEvents && !day.isToday && (
              <View style={[styles.eventDot, { backgroundColor: theme.colors.accent.primary }]} />
            )}
          </Pressable>
        ))}
      </View>

      <Pressable onPress={onSwitchToAgenda} testID="switch-to-agenda">
        <Text style={[styles.agendaLink, { color: theme.colors.accent.primary }]}>
          Switch to Agenda View
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  navArrow: { fontSize: 28, fontWeight: "300", paddingHorizontal: 16 },
  monthTitle: { fontSize: 20, fontWeight: "600" },
  weekdayRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 8 },
  weekday: { fontSize: 13, fontWeight: "500", width: 40, textAlign: "center" },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: {
    width: `${String(100 / 7)}%` as DimensionValue,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: { fontSize: 16 },
  eventDot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 2 },
  agendaLink: { fontSize: 14, fontWeight: "500", textAlign: "center", marginTop: 24 },
});
