import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

interface InviteEntry {
  name: string;
  phone: string;
  relationship: string;
}

function emptyEntry(): InviteEntry {
  return { name: "", phone: "", relationship: "" };
}

interface InviteMembersScreenProps {
  familyName: string;
  onSubmit: (invites: InviteEntry[]) => void;
  onSkip: () => void;
}

export function InviteMembersScreen({ familyName, onSubmit, onSkip }: InviteMembersScreenProps) {
  const theme = useTheme();
  const [entries, setEntries] = useState([emptyEntry(), emptyEntry()]);

  function updateEntry(index: number, field: keyof InviteEntry, value: string) {
    setEntries((prev) => {
      const updated = [...prev];
      const entry = updated[index];
      if (entry !== undefined) {
        updated[index] = { ...entry, [field]: value };
      }
      return updated;
    });
  }

  function addEntry() {
    setEntries((prev) => [...prev, emptyEntry()]);
  }

  const validEntries = entries.filter(
    (e) => e.name.trim().length > 0 && e.phone.trim().length >= 10,
  );
  const hasValidEntries = validEntries.length > 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.celebration, { color: theme.colors.accent.primary }]}>
        {familyName} is ready!
      </Text>

      <Text style={[styles.subtitle, { color: theme.colors.text.primary }]}>
        Now let's bring your family in. Who do you want to invite first?
      </Text>

      {entries.map((entry, index) => (
        <View
          key={index}
          style={[
            styles.entryCard,
            {
              backgroundColor: theme.colors.background.card,
              borderColor: theme.colors.border.secondary,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { color: theme.colors.text.primary, borderColor: theme.colors.border.primary },
            ]}
            value={entry.name}
            onChangeText={(v) => {
              updateEntry(index, "name", v);
            }}
            placeholder="Name"
            placeholderTextColor={theme.colors.text.tertiary}
            testID={`invite-name-${String(index)}`}
          />
          <TextInput
            style={[
              styles.input,
              { color: theme.colors.text.primary, borderColor: theme.colors.border.primary },
            ]}
            value={entry.phone}
            onChangeText={(v) => {
              updateEntry(index, "phone", v);
            }}
            placeholder="Phone number"
            placeholderTextColor={theme.colors.text.tertiary}
            keyboardType="phone-pad"
            testID={`invite-phone-${String(index)}`}
          />
          <TextInput
            style={[
              styles.input,
              { color: theme.colors.text.primary, borderColor: theme.colors.border.primary },
            ]}
            value={entry.relationship}
            onChangeText={(v) => {
              updateEntry(index, "relationship", v);
            }}
            placeholder="They are your..."
            placeholderTextColor={theme.colors.text.tertiary}
            testID={`invite-relationship-${String(index)}`}
          />
        </View>
      ))}

      <Pressable
        style={[styles.addButton, { borderColor: theme.colors.border.primary }]}
        onPress={addEntry}
        testID="add-another-button"
      >
        <Text style={[styles.addButtonText, { color: theme.colors.accent.primary }]}>
          + Add another
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.submitButton,
          {
            backgroundColor: hasValidEntries
              ? theme.colors.accent.primary
              : theme.colors.background.tertiary,
          },
        ]}
        onPress={() => {
          if (hasValidEntries) {
            onSubmit(validEntries);
          }
        }}
        disabled={!hasValidEntries}
        testID="send-invites-button"
      >
        <Text
          style={[
            styles.submitButtonText,
            { color: hasValidEntries ? theme.colors.accent.onColor : theme.colors.text.tertiary },
          ]}
        >
          Send Invites & Start
        </Text>
      </Pressable>

      <Text
        style={[styles.skipLink, { color: theme.colors.text.tertiary }]}
        onPress={onSkip}
        testID="skip-invites-link"
      >
        I'll do this later
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 48,
  },
  celebration: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  entryCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  input: {
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addButton: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: "500",
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  skipLink: {
    fontSize: 14,
    textAlign: "center",
  },
});
