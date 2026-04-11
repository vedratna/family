import type { RelationshipType, RelationshipStatus } from "@family-app/shared";
import { useCallback, useMemo } from "react";
import { Pressable, Text } from "react-native";

import { useFamily } from "../providers/FamilyProvider";
import { useMockData } from "../providers/MockDataProvider";
import { useNavigation } from "../shared/navigation/ScreenRouter";

interface TreeNodeData {
  personId: string;
  name: string;
  hasAppAccount: boolean;
  generation: number;
  spouseIds: string[];
}

interface FamilyTreeScreenProps {
  nodes: TreeNodeData[];
  generations: number;
  onViewPosts: (personId: string) => void;
  onViewRelationships: (personId: string) => void;
}

interface PerspectiveRelationship {
  label: string;
  otherPersonName: string;
  type: RelationshipType;
  status: RelationshipStatus;
}

interface PersonRelationshipsScreenProps {
  personName: string;
  relationships: PerspectiveRelationship[];
}

// Placeholder screen components
function FamilyTreeScreen(_props: FamilyTreeScreenProps) {
  return null;
}

function PersonRelationshipsScreen(_props: PersonRelationshipsScreenProps) {
  return null;
}

export function TreeContainer() {
  const { familyTree, persons, relationships } = useMockData();
  const { activeFamilyId } = useFamily();
  const { screenState, navigate, goBack } = useNavigation();

  const selectedPersonId =
    screenState.screen === "person" ? (screenState.params["personId"] ?? "") : "";

  const nodes = useMemo<TreeNodeData[]>(
    () =>
      familyTree.nodes.map((n) => ({
        personId: n.personId,
        name: n.name,
        hasAppAccount: n.hasAppAccount,
        generation: n.generation,
        spouseIds: n.spouseIds,
      })),
    [familyTree.nodes],
  );

  const familyRelationships = useMemo(
    () => relationships.filter((r) => r.familyId === activeFamilyId),
    [relationships, activeFamilyId],
  );

  const perspectiveRelationships = useMemo<PerspectiveRelationship[]>(() => {
    if (!selectedPersonId) return [];
    return familyRelationships
      .filter((r) => r.personAId === selectedPersonId || r.personBId === selectedPersonId)
      .map((r) => {
        const isA = r.personAId === selectedPersonId;
        const otherPersonId = isA ? r.personBId : r.personAId;
        const label = isA ? r.aToBLabel : r.bToALabel;
        const otherPerson = persons.find((p) => p.id === otherPersonId);
        return {
          label,
          otherPersonName: otherPerson?.name ?? otherPersonId,
          type: r.type,
          status: r.status,
        };
      });
  }, [familyRelationships, selectedPersonId, persons]);

  const onViewRelationships = useCallback(
    (personId: string) => {
      navigate("person", { personId });
    },
    [navigate],
  );

  if (screenState.screen === "person") {
    const person = persons.find((p) => p.id === selectedPersonId);

    return (
      <>
        <Pressable onPress={goBack}>
          <Text>{"← Back"}</Text>
        </Pressable>
        <PersonRelationshipsScreen
          personName={person?.name ?? selectedPersonId}
          relationships={perspectiveRelationships}
        />
      </>
    );
  }

  return (
    <FamilyTreeScreen
      nodes={nodes}
      generations={familyTree.generations}
      onViewPosts={() => {}}
      onViewRelationships={onViewRelationships}
    />
  );
}
