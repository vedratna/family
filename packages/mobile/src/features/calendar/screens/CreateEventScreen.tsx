import type { EventType } from "@family-app/shared";
import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

interface CreateEventScreenProps {
  onSubmit: (data: {
    title: string;
    description?: string;
    eventType: EventType;
    startDate: string;
    startTime?: string;
    location?: string;
    recurrenceRule?: string;
  }) => void;
}

const EVENT_TYPE_OPTIONS: { value: EventType; label: string; emoji: string }[] = [
  { value: "birthday", label: "Birthday", emoji: "\uD83C\uDF82" },
  { value: "marriage", label: "Marriage", emoji: "\uD83D\uDC8D" },
  { value: "anniversary", label: "Anniversary", emoji: "\u2764\uFE0F" },
  { value: "exam", label: "Exam", emoji: "\uD83D\uDCDA" },
  { value: "social-function", label: "Social Function", emoji: "\uD83C\uDF89" },
  { value: "holiday", label: "Holiday", emoji: "\uD83C\uDF34" },
  { value: "custom", label: "Other", emoji: "\uD83D\uDCC5" },
];

export function CreateEventScreen({ onSubmit }: CreateEventScreenProps) {
  const theme = useTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<EventType>("custom");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [location, setLocation] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  const isValid = title.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(startDate);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.label, { color: theme.colors.text.primary }]}>Event Title</Text>
      <TextInput
        style={[styles.input, { color: theme.colors.text.primary, borderColor: theme.colors.border.primary, backgroundColor: theme.colors.background.card }]}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g., Grandma's Birthday"
        placeholderTextColor={theme.colors.text.tertiary}
        testID="event-title-input"
      />

      <Text style={[styles.label, { color: theme.colors.text.primary }]}>Event Type</Text>
      <View style={styles.typeRow}>
        {EVENT_TYPE_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={[
              styles.typeChip,
              {
                backgroundColor: eventType === opt.value ? theme.colors.accent.light : theme.colors.background.card,
                borderColor: eventType === opt.value ? theme.colors.accent.primary : theme.colors.border.primary,
              },
            ]}
            onPress={() => { setEventType(opt.value); }}
            testID={`event-type-${opt.value}`}
          >
            <Text style={styles.typeEmoji}>{opt.emoji}</Text>
            <Text style={[styles.typeLabel, { color: theme.colors.text.primary }]}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.label, { color: theme.colors.text.primary }]}>Date (YYYY-MM-DD)</Text>
      <TextInput
        style={[styles.input, { color: theme.colors.text.primary, borderColor: theme.colors.border.primary, backgroundColor: theme.colors.background.card }]}
        value={startDate}
        onChangeText={setStartDate}
        placeholder="2026-04-12"
        placeholderTextColor={theme.colors.text.tertiary}
        testID="event-date-input"
      />

      <Text style={[styles.label, { color: theme.colors.text.primary }]}>Time (optional)</Text>
      <TextInput
        style={[styles.input, { color: theme.colors.text.primary, borderColor: theme.colors.border.primary, backgroundColor: theme.colors.background.card }]}
        value={startTime}
        onChangeText={setStartTime}
        placeholder="18:00"
        placeholderTextColor={theme.colors.text.tertiary}
        testID="event-time-input"
      />

      <Text style={[styles.label, { color: theme.colors.text.primary }]}>Location (optional)</Text>
      <TextInput
        style={[styles.input, { color: theme.colors.text.primary, borderColor: theme.colors.border.primary, backgroundColor: theme.colors.background.card }]}
        value={location}
        onChangeText={setLocation}
        placeholder="e.g., Grandma's House"
        placeholderTextColor={theme.colors.text.tertiary}
        testID="event-location-input"
      />

      <Text style={[styles.label, { color: theme.colors.text.primary }]}>Description (optional)</Text>
      <TextInput
        style={[styles.input, styles.multiline, { color: theme.colors.text.primary, borderColor: theme.colors.border.primary, backgroundColor: theme.colors.background.card }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Add details..."
        placeholderTextColor={theme.colors.text.tertiary}
        multiline
        testID="event-description-input"
      />

      <Pressable
        style={[styles.recurringToggle, { borderColor: theme.colors.border.primary }]}
        onPress={() => { setIsRecurring((prev) => !prev); }}
        testID="recurring-toggle"
      >
        <Text style={{ color: theme.colors.text.primary }}>
          {isRecurring ? "\u2611" : "\u2610"} Repeat annually
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, { backgroundColor: isValid ? theme.colors.accent.primary : theme.colors.background.tertiary }]}
        onPress={() => {
          if (isValid) {
            onSubmit({
              title: title.trim(),
              eventType,
              startDate,
              ...(description.trim().length > 0 ? { description: description.trim() } : {}),
              ...(startTime.length > 0 ? { startTime } : {}),
              ...(location.trim().length > 0 ? { location: location.trim() } : {}),
              ...(isRecurring ? { recurrenceRule: "ANNUALLY" as const } : {}),
            });
          }
        }}
        disabled={!isValid}
        testID="create-event-button"
      >
        <Text style={[styles.buttonText, { color: isValid ? theme.colors.accent.onColor : theme.colors.text.tertiary }]}>
          Create Event
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 8, marginTop: 16 },
  input: { fontSize: 16, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: { flexDirection: "row", borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, gap: 4, alignItems: "center" },
  typeEmoji: { fontSize: 16 },
  typeLabel: { fontSize: 13 },
  recurringToggle: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderRadius: 10 },
  button: { borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 24 },
  buttonText: { fontSize: 16, fontWeight: "600" },
});
