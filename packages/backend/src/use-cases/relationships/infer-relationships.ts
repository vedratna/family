import type { Relationship, RelationshipType } from "@family-app/shared";

import type { IRelationshipRepository } from "../../repositories/interfaces/relationship-repo";

interface InferredSuggestion {
  personAId: string;
  personBId: string;
  aToBLabel: string;
  bToALabel: string;
  type: RelationshipType;
  reason: string;
}

/**
 * Relationship inference engine.
 *
 * When a new relationship is confirmed, this engine examines existing relationships
 * in the family graph and suggests new ones. All suggestions are stored as "pending"
 * and require admin confirmation.
 *
 * Inference rules:
 * - Parent + Parent's Spouse → Step-parent or co-parent
 * - Parent's Parent → Grandparent / Grandchild
 * - Parent's Sibling → Uncle/Aunt / Nephew/Niece
 * - Sibling's Spouse → Sibling-in-law
 * - Spouse's Parent → Parent-in-law / Child-in-law
 * - Parent's Sibling's Child → Cousin
 */
export class InferRelationships {
  constructor(private readonly relationshipRepo: IRelationshipRepository) {}

  async execute(familyId: string, newRelationship: Relationship): Promise<InferredSuggestion[]> {
    const allRelationships = await this.relationshipRepo.getByFamily(familyId);
    const confirmed = allRelationships.filter((r) => r.status === "confirmed");

    const suggestions: InferredSuggestion[] = [];
    const existingPairs = new Set(
      allRelationships.map((r) => pairKey(r.personAId, r.personBId)),
    );

    // Build adjacency for traversal
    const graph = buildGraph(confirmed);

    if (newRelationship.type === "parent-child") {
      this.inferFromParentChild(newRelationship, graph, existingPairs, suggestions);
    }

    if (newRelationship.type === "spouse") {
      this.inferFromSpouse(newRelationship, graph, existingPairs, suggestions);
    }

    // Store suggestions as pending relationships
    for (const suggestion of suggestions) {
      const pendingRel: Relationship = {
        id: crypto.randomUUID(),
        familyId,
        personAId: suggestion.personAId,
        personBId: suggestion.personBId,
        aToBLabel: suggestion.aToBLabel,
        bToALabel: suggestion.bToALabel,
        type: suggestion.type,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      await this.relationshipRepo.create(pendingRel);
    }

    return suggestions;
  }

  private inferFromParentChild(
    rel: Relationship,
    graph: RelationshipGraph,
    existing: Set<string>,
    suggestions: InferredSuggestion[],
  ): void {
    const parentId = rel.personAId;
    const childId = rel.personBId;

    // Grandparent: if parent has a parent, that's grandparent to child
    const parentParents = getRelatedByType(graph, parentId, "parent-child", "child");
    for (const grandparentId of parentParents) {
      if (!existing.has(pairKey(grandparentId, childId))) {
        suggestions.push({
          personAId: grandparentId,
          personBId: childId,
          aToBLabel: "Grandparent",
          bToALabel: "Grandchild",
          type: "grandparent-grandchild",
          reason: `${grandparentId} is parent of ${parentId}, who is parent of ${childId}`,
        });
      }
    }

    // Uncle/Aunt: if parent has siblings, they're uncle/aunt to child
    const parentSiblings = getRelatedByType(graph, parentId, "sibling", "either");
    for (const uncleAuntId of parentSiblings) {
      if (!existing.has(pairKey(uncleAuntId, childId))) {
        suggestions.push({
          personAId: uncleAuntId,
          personBId: childId,
          aToBLabel: "Uncle/Aunt",
          bToALabel: "Nephew/Niece",
          type: "uncle-aunt",
          reason: `${uncleAuntId} is sibling of ${parentId}, who is parent of ${childId}`,
        });
      }
    }

    // Cousin: if parent has siblings with children, those children are cousins
    for (const uncleAuntId of parentSiblings) {
      const cousinIds = getRelatedByType(graph, uncleAuntId, "parent-child", "parent");
      for (const cousinId of cousinIds) {
        if (cousinId !== childId && !existing.has(pairKey(childId, cousinId))) {
          suggestions.push({
            personAId: childId,
            personBId: cousinId,
            aToBLabel: "Cousin",
            bToALabel: "Cousin",
            type: "cousin",
            reason: `${childId}'s parent ${parentId} is sibling of ${uncleAuntId}, who is parent of ${cousinId}`,
          });
        }
      }
    }
  }

  private inferFromSpouse(
    rel: Relationship,
    graph: RelationshipGraph,
    existing: Set<string>,
    suggestions: InferredSuggestion[],
  ): void {
    const personA = rel.personAId;
    const personB = rel.personBId;

    // Parent-in-law: spouse's parents become in-laws
    for (const [spouse, other] of [[personA, personB], [personB, personA]] as const) {
      const spouseParents = getRelatedByType(graph, spouse, "parent-child", "child");
      for (const parentInLawId of spouseParents) {
        if (!existing.has(pairKey(parentInLawId, other))) {
          suggestions.push({
            personAId: parentInLawId,
            personBId: other,
            aToBLabel: "Parent-in-law",
            bToALabel: "Child-in-law",
            type: "in-law",
            reason: `${parentInLawId} is parent of ${spouse}, who is spouse of ${other}`,
          });
        }
      }

      // Sibling-in-law: spouse's siblings become siblings-in-law
      const spouseSiblings = getRelatedByType(graph, spouse, "sibling", "either");
      for (const siblingInLawId of spouseSiblings) {
        if (!existing.has(pairKey(siblingInLawId, other))) {
          suggestions.push({
            personAId: siblingInLawId,
            personBId: other,
            aToBLabel: "Sibling-in-law",
            bToALabel: "Sibling-in-law",
            type: "in-law",
            reason: `${siblingInLawId} is sibling of ${spouse}, who is spouse of ${other}`,
          });
        }
      }
    }
  }
}

// --- Graph utilities ---

interface RelationshipEdge {
  otherPersonId: string;
  type: RelationshipType;
  role: "parent" | "child" | "either";
}

type RelationshipGraph = Map<string, RelationshipEdge[]>;

function buildGraph(relationships: Relationship[]): RelationshipGraph {
  const graph: RelationshipGraph = new Map();

  function addEdge(personId: string, edge: RelationshipEdge): void {
    const edges = graph.get(personId) ?? [];
    edges.push(edge);
    graph.set(personId, edges);
  }

  for (const rel of relationships) {
    if (rel.type === "parent-child") {
      // personA is parent, personB is child
      addEdge(rel.personAId, { otherPersonId: rel.personBId, type: "parent-child", role: "parent" });
      addEdge(rel.personBId, { otherPersonId: rel.personAId, type: "parent-child", role: "child" });
    } else if (rel.type === "sibling") {
      addEdge(rel.personAId, { otherPersonId: rel.personBId, type: "sibling", role: "either" });
      addEdge(rel.personBId, { otherPersonId: rel.personAId, type: "sibling", role: "either" });
    } else if (rel.type === "spouse") {
      addEdge(rel.personAId, { otherPersonId: rel.personBId, type: "spouse", role: "either" });
      addEdge(rel.personBId, { otherPersonId: rel.personAId, type: "spouse", role: "either" });
    } else {
      addEdge(rel.personAId, { otherPersonId: rel.personBId, type: rel.type, role: "either" });
      addEdge(rel.personBId, { otherPersonId: rel.personAId, type: rel.type, role: "either" });
    }
  }

  return graph;
}

function getRelatedByType(
  graph: RelationshipGraph,
  personId: string,
  type: RelationshipType,
  roleFilter: "parent" | "child" | "either",
): string[] {
  const edges = graph.get(personId) ?? [];
  return edges
    .filter((e) => e.type === type && (roleFilter === "either" || e.role === roleFilter))
    .map((e) => e.otherPersonId);
}

function pairKey(a: string, b: string): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}
