import type { RSVPStatus } from "@family-app/shared";
import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

interface RSVPEntry {
  personName: string;
  status: RSVPStatus;
}

interface EventDetailScreenProps {
  title: string;
  eventType: string;
  startDate: string;
  startTime?: string;
  location?: string;
  description?: string;
  isRecurring: boolean;
  userRSVP?: RSVPStatus;
  attendees: RSVPEntry[];
  onRSVP: (status: RSVPStatus) => void;
  onEdit: () => void;
  canEdit: boolean;
}

const RSVP_OPTIONS: { status: RSVPStatus; label: string }[] = [
  { status: "going", label: "Going" },
  { status: "maybe", label: "Maybe" },
  { status: "not-going", label: "Not Going" },
];

export function EventDetailScreen({
  title,
  eventType: _eventType,
  startDate,
  startTime,
  location,
  description,
  isRecurring,
  userRSVP,
  attendees,
  onRSVP,
  onEdit,
  canEdit,
}: EventDetailScreenProps) {
  const theme = useTheme();

  const goingCount = attendees.filter((a) => a.status === "going").length;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>{title}</Text>

      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: theme.colors.text.secondary }]}>
          {startDate}
          {startTime !== undefined ? ` at ${startTime}` : ""}
        </Text>
        {location !== undefined && (
          <Text style={[styles.meta, { color: theme.colors.text.secondary }]}>
            {"\uD83D\uDCCD"} {location}
          </Text>
        )}
        {isRecurring && (
          <Text style={[styles.meta, { color: theme.colors.accent.primary }]}>
            {"\uD83D\uDD01"} Repeats annually
          </Text>
        )}
      </View>

      {description !== undefined && (
        <Text style={[styles.description, { color: theme.colors.text.primary }]}>
          {description}
        </Text>
      )}

      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Your RSVP</Text>
      <View style={styles.rsvpRow}>
        {RSVP_OPTIONS.map((opt) => (
          <Pressable
            key={opt.status}
            style={[
              styles.rsvpButton,
              {
                backgroundColor:
                  userRSVP === opt.status
                    ? theme.colors.accent.primary
                    : theme.colors.background.card,
                borderColor:
                  userRSVP === opt.status
                    ? theme.colors.accent.primary
                    : theme.colors.border.primary,
              },
            ]}
            onPress={() => {
              onRSVP(opt.status);
            }}
            testID={`rsvp-${opt.status}`}
          >
            <Text
              style={[
                styles.rsvpText,
                {
                  color:
                    userRSVP === opt.status
                      ? theme.colors.accent.onColor
                      : theme.colors.text.primary,
                },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        Attendees ({String(goingCount)} going)
      </Text>
      <FlatList
        data={attendees}
        keyExtractor={(item) => item.personName}
        renderItem={({ item }) => (
          <View style={styles.attendeeRow}>
            <Text style={[styles.attendeeName, { color: theme.colors.text.primary }]}>
              {item.personName}
            </Text>
            <Text style={[styles.attendeeStatus, { color: theme.colors.text.tertiary }]}>
              {item.status}
            </Text>
          </View>
        )}
      />

      {canEdit && (
        <Pressable
          style={[styles.editButton, { borderColor: theme.colors.accent.primary }]}
          onPress={onEdit}
          testID="edit-event-button"
        >
          <Text style={[styles.editButtonText, { color: theme.colors.accent.primary }]}>
            Edit Event
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 12 },
  metaRow: { gap: 4, marginBottom: 16 },
  meta: { fontSize: 15 },
  description: { fontSize: 16, lineHeight: 24, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12, marginTop: 8 },
  rsvpRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  rsvpButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  rsvpText: { fontSize: 14, fontWeight: "600" },
  attendeeRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  attendeeName: { fontSize: 15 },
  attendeeStatus: { fontSize: 13, textTransform: "capitalize" },
  editButton: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  editButtonText: { fontSize: 16, fontWeight: "600" },
});
