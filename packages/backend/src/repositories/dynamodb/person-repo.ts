import type { Person } from "@family-app/shared";

import type { IPersonRepository } from "../interfaces/person-repo";

import { keys } from "./keys";
import { deleteItem, getItem, putItem, queryItems, updateItem } from "./operations";
import type { DynamoItem } from "./operations";

export class DynamoPersonRepository implements IPersonRepository {
  async create(person: Person): Promise<void> {
    const item: DynamoItem = {
      PK: keys.family.pk(person.familyId),
      SK: keys.family.sk.person(person.id),
      name: person.name,
      familyId: person.familyId,
      createdAt: person.createdAt,
      entityType: "Person",
    };
    if (person.userId !== undefined) {
      item["GSI1PK"] = keys.gsi1.user(person.userId);
      item["GSI1SK"] = keys.gsi1.family(person.familyId);
      item["userId"] = person.userId;
    }
    if (person.profilePhotoKey !== undefined) {
      item["profilePhotoKey"] = person.profilePhotoKey;
    }
    await putItem(item);
  }

  async getById(familyId: string, personId: string): Promise<Person | undefined> {
    const item = await getItem(keys.family.pk(familyId), keys.family.sk.person(personId));
    if (item === undefined) {
      return undefined;
    }
    return this.toEntity(personId, item);
  }

  async getByFamilyId(familyId: string): Promise<Person[]> {
    const result = await queryItems("PK", keys.family.pk(familyId), keys.prefix.person);
    return result.items.map((item) => {
      const personId = item["SK"].replace("PERSON#", "");
      return this.toEntity(personId, item);
    });
  }

  async getByUserId(familyId: string, userId: string): Promise<Person | undefined> {
    const result = await queryItems("GSI1PK", keys.gsi1.user(userId), undefined, {
      indexName: "GSI1",
      filterExpression: "familyId = :familyId",
      expressionAttributeValues: { ":familyId": familyId },
    });
    const item = result.items[0];
    if (item === undefined) {
      return undefined;
    }
    const personId = item["SK"].replace("PERSON#", "");
    return this.toEntity(personId, item);
  }

  async update(
    familyId: string,
    personId: string,
    updates: Partial<Pick<Person, "name" | "profilePhotoKey">>,
  ): Promise<void> {
    const dynamoUpdates: Record<string, string> = {};
    if (updates.name !== undefined) {
      dynamoUpdates["name"] = updates.name;
    }
    if (updates.profilePhotoKey !== undefined) {
      dynamoUpdates["profilePhotoKey"] = updates.profilePhotoKey;
    }
    await updateItem(keys.family.pk(familyId), keys.family.sk.person(personId), dynamoUpdates);
  }

  async delete(familyId: string, personId: string): Promise<void> {
    await deleteItem(keys.family.pk(familyId), keys.family.sk.person(personId));
  }

  private toEntity(personId: string, item: Record<string, unknown>): Person {
    const person: Person = {
      id: personId,
      familyId: item["familyId"] as string,
      name: item["name"] as string,
      createdAt: item["createdAt"] as string,
    };
    if (typeof item["userId"] === "string") {
      person.userId = item["userId"];
    }
    if (typeof item["profilePhotoKey"] === "string") {
      person.profilePhotoKey = item["profilePhotoKey"];
    }
    return person;
  }
}
