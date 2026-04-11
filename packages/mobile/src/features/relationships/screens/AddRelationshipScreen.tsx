import type { RelationshipType } from "@family-app/shared";
import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

interface PersonOption {
  id: string;
  name: string;
}

interface AddRelationshipScreenProps {
  persons: PersonOption[];
  onSubmit: (data: {
    personAId: string;
    personBId: string;
    aToBLabel: string;
    bToALabel: string;
    type: RelationshipType;
  }) => void;
}

const RELATIONSHIP_TYPE_OPTIONS: { value: RelationshipType; label: string }[] = [
  { value: "parent-child", label: "Parent / Child" },
  { value: "spouse", label: "Spouse" },
  { value: "sibling", label: "Sibling" },
  { value: "in-law", label: "In-law" },
  { value: "grandparent-grandchild", label: "Grandparent / Grandchild" },
  { value: "uncle-aunt", label: "Uncle/Aunt / Nephew/Niece" },
  { value: "cousin", label: "Cousin" },
  { value: "custom", label: "Custom" },
];

export function AddRelationshipScreen({ persons, onSubmit }: AddRelationshipScreenProps) {
  const theme = useTheme();
  const [personAId, setPersonAId] = useState("");
  const [personBId, setPersonBId] = useState("");
  const [aToBLabel, setAToBLabel] = useState("");
  const [bToALabel, setBToALabel] = useState("");
  const [type, setType] = useState<RelationshipType>("parent-child");

  const isValid =
    personAId.length > 0 &&
    personBId.length > 0 &&
    personAId !== personBId &&
    aToBLabel.trim().length > 0 &&
    bToALabel.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>Define Relationship</Text>

      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Person A</Text>
      {persons.map((p) => (
        <Pressable
          key={p.id}
          style={[
            styles.personOption,
            {
              backgroundColor:
                personAId === p.id ? theme.colors.accent.light : theme.colors.background.card,
              borderColor:
                personAId === p.id ? theme.colors.accent.primary : theme.colors.border.primary,
            },
          ]}
          onPress={() => {
            setPersonAId(p.id);
          }}
          testID={`personA-${p.id}`}
        >
          <Text style={{ color: theme.colors.text.primary }}>{p.name}</Text>
        </Pressable>
      ))}

      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
        is the ___ of (A to B label)
      </Text>
      <TextInput
        style={[
          styles.input,
          { color: theme.colors.text.primary, borderColor: theme.colors.border.primary },
        ]}
        value={aToBLabel}
        onChangeText={setAToBLabel}
        placeholder="e.g., Mother"
        placeholderTextColor={theme.colors.text.tertiary}
        testID="a-to-b-label"
      />

      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Person B</Text>
      {persons
        .filter((p) => p.id !== personAId)
        .map((p) => (
          <Pressable
            key={p.id}
            style={[
              styles.personOption,
              {
                backgroundColor:
                  personBId === p.id ? theme.colors.accent.light : theme.colors.background.card,
                borderColor:
                  personBId === p.id ? theme.colors.accent.primary : theme.colors.border.primary,
              },
            ]}
            onPress={() => {
              setPersonBId(p.id);
            }}
            testID={`personB-${p.id}`}
          >
            <Text style={{ color: theme.colors.text.primary }}>{p.name}</Text>
          </Pressable>
        ))}

      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
        is the ___ of A (B to A label)
      </Text>
      <TextInput
        style={[
          styles.input,
          { color: theme.colors.text.primary, borderColor: theme.colors.border.primary },
        ]}
        value={bToALabel}
        onChangeText={setBToALabel}
        placeholder="e.g., Son"
        placeholderTextColor={theme.colors.text.tertiary}
        testID="b-to-a-label"
      />

      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Relationship Type</Text>
      <View style={styles.typeRow}>
        {RELATIONSHIP_TYPE_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={[
              styles.typeChip,
              {
                backgroundColor:
                  type === opt.value ? theme.colors.accent.primary : theme.colors.background.card,
                borderColor:
                  type === opt.value ? theme.colors.accent.primary : theme.colors.border.primary,
              },
            ]}
            onPress={() => {
              setType(opt.value);
            }}
            testID={`type-${opt.value}`}
          >
            <Text
              style={{
                color: type === opt.value ? theme.colors.accent.onColor : theme.colors.text.primary,
                fontSize: 13,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[
          styles.button,
          {
            backgroundColor: isValid
              ? theme.colors.accent.primary
              : theme.colors.background.tertiary,
          },
        ]}
        onPress={() => {
          if (isValid) {
            onSubmit({
              personAId,
              personBId,
              aToBLabel: aToBLabel.trim(),
              bToALabel: bToALabel.trim(),
              type,
            });
          }
        }}
        disabled={!isValid}
        testID="save-relationship-button"
      >
        <Text
          style={[
            styles.buttonText,
            { color: isValid ? theme.colors.accent.onColor : theme.colors.text.tertiary },
          ]}
        >
          Save Relationship
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 8, marginTop: 16 },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
  },
  personOption: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: { borderWidth: 1, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  button: { borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 24 },
  buttonText: { fontSize: 16, fontWeight: "600" },
});
