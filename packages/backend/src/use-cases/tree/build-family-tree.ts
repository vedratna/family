import type { Person, Relationship } from "@family-app/shared";

import type { IPersonRepository } from "../../repositories/interfaces/person-repo";
import type { IRelationshipRepository } from "../../repositories/interfaces/relationship-repo";

export interface TreeNode {
  person: Person;
  generation: number;
  spouseIds: string[];
  childIds: string[];
  parentIds: string[];
}

export interface FamilyTree {
  nodes: Map<string, TreeNode>;
  rootIds: string[];
  generations: number;
}

export class BuildFamilyTree {
  constructor(
    private readonly personRepo: IPersonRepository,
    private readonly relationshipRepo: IRelationshipRepository,
  ) {}

  async execute(familyId: string): Promise<FamilyTree> {
    const [persons, relationships] = await Promise.all([
      this.personRepo.getByFamilyId(familyId),
      this.relationshipRepo.getByFamily(familyId),
    ]);

    const confirmed = relationships.filter((r) => r.status === "confirmed");

    return buildTreeFromData(persons, confirmed);
  }
}

export function buildTreeFromData(persons: Person[], relationships: Relationship[]): FamilyTree {
  const nodes = new Map<string, TreeNode>();

  // Initialize all nodes
  for (const person of persons) {
    nodes.set(person.id, {
      person,
      generation: 0,
      spouseIds: [],
      childIds: [],
      parentIds: [],
    });
  }

  // Only use confirmed relationships for tree building
  const confirmed = relationships.filter((r) => r.status === "confirmed");

  // Build connections from relationships
  for (const rel of confirmed) {
    const nodeA = nodes.get(rel.personAId);
    const nodeB = nodes.get(rel.personBId);
    if (nodeA === undefined || nodeB === undefined) {
      continue;
    }

    if (rel.type === "parent-child") {
      // personA is parent, personB is child
      nodeA.childIds.push(rel.personBId);
      nodeB.parentIds.push(rel.personAId);
    } else if (rel.type === "spouse") {
      nodeA.spouseIds.push(rel.personBId);
      nodeB.spouseIds.push(rel.personAId);
    }
  }

  // Find root nodes: persons with no parents who are NOT solely connected via a spouse link
  // to someone who has parents. True roots are: no parents, and either have children or
  // are not a spouse of someone who has parents.
  const spouseOfNonRoot = new Set<string>();
  for (const [_id, node] of nodes) {
    if (node.parentIds.length > 0) {
      // This person has parents — their spouses are NOT roots
      for (const spouseId of node.spouseIds) {
        spouseOfNonRoot.add(spouseId);
      }
    }
  }

  const rootIds = [...nodes.entries()]
    .filter(([id, node]) => node.parentIds.length === 0 && !spouseOfNonRoot.has(id))
    .map(([id]) => id);

  // Assign generation levels using BFS from roots
  assignGenerations(nodes, rootIds);

  // Count distinct generations
  const generationValues = new Set([...nodes.values()].map((n) => n.generation));
  const generations = generationValues.size;

  return { nodes, rootIds, generations };
}

function assignGenerations(nodes: Map<string, TreeNode>, rootIds: string[]): void {
  const visited = new Set<string>();
  const queue: { id: string; generation: number }[] = [];

  // Start roots at generation 0
  for (const rootId of rootIds) {
    queue.push({ id: rootId, generation: 0 });
  }

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) {
      break;
    }

    if (visited.has(current.id)) {
      continue;
    }
    visited.add(current.id);

    const node = nodes.get(current.id);
    if (node === undefined) {
      continue;
    }

    node.generation = current.generation;

    // Spouses are same generation
    for (const spouseId of node.spouseIds) {
      if (!visited.has(spouseId)) {
        queue.push({ id: spouseId, generation: current.generation });
      }
    }

    // Children are next generation
    for (const childId of node.childIds) {
      if (!visited.has(childId)) {
        queue.push({ id: childId, generation: current.generation + 1 });
      }
    }

    // Parents are previous generation (for nodes discovered via children first)
    for (const parentId of node.parentIds) {
      if (!visited.has(parentId)) {
        queue.push({ id: parentId, generation: current.generation - 1 });
      }
    }
  }

  // Normalize: shift so minimum generation is 0
  const minGen = Math.min(...[...nodes.values()].map((n) => n.generation));
  if (minGen !== 0) {
    for (const node of nodes.values()) {
      node.generation -= minGen;
    }
  }
}

export interface SerializedTree {
  nodes: SerializedTreeNode[];
  rootIds: string[];
  generations: number;
}

export interface SerializedTreeNode {
  personId: string;
  name: string;
  hasAppAccount: boolean;
  profilePhotoKey?: string;
  generation: number;
  spouseIds: string[];
  childIds: string[];
  parentIds: string[];
}

export function serializeTree(tree: FamilyTree): SerializedTree {
  const nodes: SerializedTreeNode[] = [];

  for (const [_, node] of tree.nodes) {
    const serialized: SerializedTreeNode = {
      personId: node.person.id,
      name: node.person.name,
      hasAppAccount: node.person.userId !== undefined,
      generation: node.generation,
      spouseIds: node.spouseIds,
      childIds: node.childIds,
      parentIds: node.parentIds,
    };
    if (node.person.profilePhotoKey !== undefined) {
      serialized.profilePhotoKey = node.person.profilePhotoKey;
    }
    nodes.push(serialized);
  }

  return {
    nodes,
    rootIds: tree.rootIds,
    generations: tree.generations,
  };
}
