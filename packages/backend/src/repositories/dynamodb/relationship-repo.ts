import type { Relationship } from "@family-app/shared";

import type { IRelationshipRepository } from "../interfaces/relationship-repo";

import { keys } from "./keys";
import { deleteItem, getItem, putItem, queryItems, updateItem } from "./operations";

export class DynamoRelationshipRepository implements IRelationshipRepository {
  async create(relationship: Relationship): Promise<void> {
    await putItem({
      PK: keys.family.pk(relationship.familyId),
      SK: keys.family.sk.relationship(relationship.personAId, relationship.personBId),
      id: relationship.id,
      personAId: relationship.personAId,
      personBId: relationship.personBId,
      aToBLabel: relationship.aToBLabel,
      bToALabel: relationship.bToALabel,
      type: relationship.type,
      status: relationship.status,
      createdAt: relationship.createdAt,
      entityType: "Relationship",
    });
  }

  async getByFamily(familyId: string): Promise<Relationship[]> {
    const result = await queryItems("PK", keys.family.pk(familyId), keys.prefix.relationship);
    return result.items.map((item) => this.toEntity(familyId, item));
  }

  async getByPerson(familyId: string, personId: string): Promise<Relationship[]> {
    const result = await queryItems("PK", keys.family.pk(familyId), keys.prefix.relationship);
    return result.items
      .filter((item) => item["personAId"] === personId || item["personBId"] === personId)
      .map((item) => this.toEntity(familyId, item));
  }

  async getById(
    familyId: string,
    personAId: string,
    personBId: string,
  ): Promise<Relationship | undefined> {
    const item = await getItem(
      keys.family.pk(familyId),
      keys.family.sk.relationship(personAId, personBId),
    );
    if (item === undefined) {
      return undefined;
    }
    return this.toEntity(familyId, item);
  }

  async update(
    familyId: string,
    personAId: string,
    personBId: string,
    updates: Partial<Pick<Relationship, "aToBLabel" | "bToALabel" | "type" | "status">>,
  ): Promise<void> {
    const fields: Record<string, string> = {};
    if (updates.aToBLabel !== undefined) {
      fields["aToBLabel"] = updates.aToBLabel;
    }
    if (updates.bToALabel !== undefined) {
      fields["bToALabel"] = updates.bToALabel;
    }
    if (updates.type !== undefined) {
      fields["type"] = updates.type;
    }
    if (updates.status !== undefined) {
      fields["status"] = updates.status;
    }
    await updateItem(
      keys.family.pk(familyId),
      keys.family.sk.relationship(personAId, personBId),
      fields,
    );
  }

  async delete(familyId: string, personAId: string, personBId: string): Promise<void> {
    await deleteItem(keys.family.pk(familyId), keys.family.sk.relationship(personAId, personBId));
  }

  async getPending(familyId: string): Promise<Relationship[]> {
    const result = await queryItems("PK", keys.family.pk(familyId), keys.prefix.relationship, {
      filterExpression: "#status = :pending",
      expressionAttributeNames: { "#status": "status" },
      expressionAttributeValues: { ":pending": "pending" },
    });
    return result.items.map((item) => this.toEntity(familyId, item));
  }

  private toEntity(familyId: string, item: Record<string, unknown>): Relationship {
    return {
      id: item["id"] as string,
      familyId,
      personAId: item["personAId"] as string,
      personBId: item["personBId"] as string,
      aToBLabel: item["aToBLabel"] as string,
      bToALabel: item["bToALabel"] as string,
      type: item["type"] as Relationship["type"],
      status: item["status"] as Relationship["status"],
      createdAt: item["createdAt"] as string,
    };
  }
}
