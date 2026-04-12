import type { Family } from "@family-app/shared";

import type { IFamilyRepository } from "../interfaces/family-repo";

import { keys } from "./keys";
import { deleteItem, getItem, putItem, updateItem } from "./operations";

export class DynamoFamilyRepository implements IFamilyRepository {
  async create(family: Family): Promise<void> {
    await putItem({
      PK: keys.family.pk(family.id),
      SK: keys.family.sk.metadata,
      name: family.name,
      createdBy: family.createdBy,
      themeName: family.themeName,
      createdAt: family.createdAt,
      entityType: "Family",
    });
  }

  async getById(familyId: string): Promise<Family | undefined> {
    const item = await getItem(keys.family.pk(familyId), keys.family.sk.metadata);
    if (item === undefined) {
      return undefined;
    }
    return this.toEntity(familyId, item);
  }

  async updateTheme(familyId: string, themeName: Family["themeName"]): Promise<void> {
    await updateItem(keys.family.pk(familyId), keys.family.sk.metadata, {
      themeName,
    });
  }

  async delete(familyId: string): Promise<void> {
    await deleteItem(keys.family.pk(familyId), keys.family.sk.metadata);
  }

  private toEntity(familyId: string, item: Record<string, unknown>): Family {
    return {
      id: familyId,
      name: item["name"] as string,
      createdBy: item["createdBy"] as string,
      themeName: item["themeName"] as Family["themeName"],
      createdAt: item["createdAt"] as string,
    };
  }
}
