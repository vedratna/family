import { keys } from "../../repositories/dynamodb/keys";
import { getItem, putItem, deleteItem } from "../../repositories/dynamodb/operations";
import type { IPersonRepository } from "../../repositories/interfaces/person-repo";
import type { IRelationshipRepository } from "../../repositories/interfaces/relationship-repo";

import { BuildFamilyTree, serializeTree, type SerializedTree } from "./build-family-tree";

export class CachedFamilyTree {
  private readonly buildTree: BuildFamilyTree;

  constructor(
    personRepo: IPersonRepository,
    relationshipRepo: IRelationshipRepository,
  ) {
    this.buildTree = new BuildFamilyTree(personRepo, relationshipRepo);
  }

  async get(familyId: string): Promise<SerializedTree> {
    // Try cache first
    const cached = await getItem(keys.family.pk(familyId), keys.family.sk.treeCache);
    if (cached !== undefined && typeof cached["treeData"] === "string") {
      return JSON.parse(cached["treeData"]) as SerializedTree;
    }

    // Cache miss — build and store
    return this.rebuild(familyId);
  }

  async rebuild(familyId: string): Promise<SerializedTree> {
    const tree = await this.buildTree.execute(familyId);
    const serialized = serializeTree(tree);

    await putItem({
      PK: keys.family.pk(familyId),
      SK: keys.family.sk.treeCache,
      treeData: JSON.stringify(serialized),
      updatedAt: new Date().toISOString(),
      entityType: "TreeCache",
    });

    return serialized;
  }

  async invalidate(familyId: string): Promise<void> {
    await deleteItem(keys.family.pk(familyId), keys.family.sk.treeCache);
  }
}
