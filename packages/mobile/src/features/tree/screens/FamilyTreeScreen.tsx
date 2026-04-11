import { useState, useCallback } from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";
import { IllustrationPlaceholder } from "../../onboarding/components/IllustrationPlaceholder";
import { PersonProfileCard } from "../components/PersonProfileCard";
import { TreeNodeCard } from "../components/TreeNodeCard";

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

export function FamilyTreeScreen({
  nodes,
  generations,
  onViewPosts,
  onViewRelationships,
}: FamilyTreeScreenProps) {
  const theme = useTheme();
  const [selectedPerson, setSelectedPerson] = useState<TreeNodeData | undefined>(undefined);

  const handleNodePress = useCallback((node: TreeNodeData) => {
    setSelectedPerson(node);
  }, []);

  const closeProfile = useCallback(() => {
    setSelectedPerson(undefined);
  }, []);

  if (nodes.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background.primary }]}>
        <IllustrationPlaceholder name="empty-tree" size={160} />
        <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
          Your family tree is empty
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.text.secondary }]}>
          Add relationships between family members to see your tree come alive!
        </Text>
      </View>
    );
  }

  // Group nodes by generation for layout
  const generationGroups: TreeNodeData[][] = Array.from({ length: generations }, () => []);
  for (const node of nodes) {
    generationGroups[node.generation]?.push(node);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScrollView
        horizontal
        contentContainerStyle={styles.scrollContent}
        showsHorizontalScrollIndicator={false}
      >
        <ScrollView contentContainerStyle={styles.verticalContent}>
          {generationGroups.map((genNodes, genIndex) => (
            <View key={genIndex} style={styles.generationRow}>
              <Text style={[styles.genLabel, { color: theme.colors.text.tertiary }]}>
                Gen {String(genIndex + 1)}
              </Text>
              <View style={styles.nodesRow}>
                {genNodes.map((node) => (
                  <TreeNodeCard
                    key={node.personId}
                    name={node.name}
                    hasAppAccount={node.hasAppAccount}
                    isHighlighted={selectedPerson?.personId === node.personId}
                    onPress={() => {
                      handleNodePress(node);
                    }}
                  />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      {selectedPerson !== undefined && (
        <PersonProfileCard
          visible
          name={selectedPerson.name}
          hasAppAccount={selectedPerson.hasAppAccount}
          onViewPosts={() => {
            onViewPosts(selectedPerson.personId);
            closeProfile();
          }}
          onViewRelationships={() => {
            onViewRelationships(selectedPerson.personId);
            closeProfile();
          }}
          onClose={closeProfile}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  verticalContent: {
    gap: 32,
  },
  generationRow: {
    gap: 8,
  },
  genLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingLeft: 4,
  },
  nodesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "flex-start",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
