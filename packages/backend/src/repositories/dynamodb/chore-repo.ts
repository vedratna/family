import type { Chore } from "@family-app/shared";

import type { IChoreRepository } from "../interfaces/chore-repo";

import { keys } from "./keys";
import { deleteItem, getItem, putItem, queryItems, updateItem } from "./operations";

export class DynamoChoreRepository implements IChoreRepository {
  async create(chore: Chore): Promise<void> {
    await putItem({
      PK: keys.family.pk(chore.familyId),
      SK: keys.family.sk.chore(chore.id),
      id: chore.id,
      title: chore.title,
      description: chore.description,
      assigneePersonId: chore.assigneePersonId,
      dueDate: chore.dueDate,
      recurrenceRule: chore.recurrenceRule,
      rotationMembers: chore.rotationMembers,
      status: chore.status,
      completedAt: chore.completedAt,
      createdAt: chore.createdAt,
      entityType: "Chore",
    });
  }

  async getById(familyId: string, choreId: string): Promise<Chore | undefined> {
    const item = await getItem(keys.family.pk(familyId), keys.family.sk.chore(choreId));
    if (item === undefined) {
      return undefined;
    }
    return this.toEntity(familyId, item);
  }

  async getByFamily(familyId: string): Promise<Chore[]> {
    const result = await queryItems("PK", keys.family.pk(familyId), keys.prefix.chore);
    return result.items.map((item) => this.toEntity(familyId, item));
  }

  async getByAssignee(familyId: string, personId: string): Promise<Chore[]> {
    const result = await queryItems("PK", keys.family.pk(familyId), keys.prefix.chore, {
      filterExpression: "assigneePersonId = :personId",
      expressionAttributeValues: { ":personId": personId },
    });
    return result.items.map((item) => this.toEntity(familyId, item));
  }

  async update(familyId: string, choreId: string, updates: Partial<Chore>): Promise<void> {
    const fields: Record<string, unknown> = {};
    if (updates.title !== undefined) {
      fields["title"] = updates.title;
    }
    if (updates.description !== undefined) {
      fields["description"] = updates.description;
    }
    if (updates.assigneePersonId !== undefined) {
      fields["assigneePersonId"] = updates.assigneePersonId;
    }
    if (updates.dueDate !== undefined) {
      fields["dueDate"] = updates.dueDate;
    }
    if (updates.recurrenceRule !== undefined) {
      fields["recurrenceRule"] = updates.recurrenceRule;
    }
    if (updates.rotationMembers !== undefined) {
      fields["rotationMembers"] = updates.rotationMembers;
    }
    if (updates.status !== undefined) {
      fields["status"] = updates.status;
    }
    if (updates.completedAt !== undefined) {
      fields["completedAt"] = updates.completedAt;
    }
    await updateItem(keys.family.pk(familyId), keys.family.sk.chore(choreId), fields);
  }

  async delete(familyId: string, choreId: string): Promise<void> {
    await deleteItem(keys.family.pk(familyId), keys.family.sk.chore(choreId));
  }

  private toEntity(familyId: string, item: Record<string, unknown>): Chore {
    const chore: Chore = {
      id: item["id"] as string,
      familyId,
      title: item["title"] as string,
      assigneePersonId: item["assigneePersonId"] as string,
      status: item["status"] as Chore["status"],
      createdAt: item["createdAt"] as string,
    };
    if (typeof item["description"] === "string") {
      chore.description = item["description"];
    }
    if (typeof item["dueDate"] === "string") {
      chore.dueDate = item["dueDate"];
    }
    if (typeof item["recurrenceRule"] === "string") {
      chore.recurrenceRule = item["recurrenceRule"];
    }
    if (Array.isArray(item["rotationMembers"])) {
      chore.rotationMembers = item["rotationMembers"] as string[];
    }
    if (typeof item["completedAt"] === "string") {
      chore.completedAt = item["completedAt"];
    }
    return chore;
  }
}
