import type { FamilyMembership } from "@family-app/shared";

import type { IMembershipRepository } from "../interfaces/membership-repo";

import { keys } from "./keys";
import { deleteItem, getItem, putItem, queryItems, updateItem } from "./operations";

export class DynamoMembershipRepository implements IMembershipRepository {
  async create(membership: FamilyMembership): Promise<void> {
    await putItem({
      PK: keys.family.pk(membership.familyId),
      SK: keys.family.sk.member(membership.personId),
      GSI1PK: keys.gsi1.user(membership.userId),
      GSI1SK: `MEMBER#${membership.familyId}`,
      familyId: membership.familyId,
      personId: membership.personId,
      userId: membership.userId,
      role: membership.role,
      joinedAt: membership.joinedAt,
      entityType: "FamilyMembership",
    });
  }

  async getByFamilyId(familyId: string): Promise<FamilyMembership[]> {
    const result = await queryItems("PK", keys.family.pk(familyId), keys.prefix.member);
    return result.items.map((item) => this.toEntity(item));
  }

  async getByUserId(userId: string): Promise<FamilyMembership[]> {
    const result = await queryItems("GSI1PK", keys.gsi1.user(userId), keys.prefix.member, {
      indexName: "GSI1",
    });
    return result.items.map((item) => this.toEntity(item));
  }

  async getByFamilyAndPerson(
    familyId: string,
    personId: string,
  ): Promise<FamilyMembership | undefined> {
    const item = await getItem(keys.family.pk(familyId), keys.family.sk.member(personId));
    if (item === undefined) {
      return undefined;
    }
    return this.toEntity(item);
  }

  async updateRole(
    familyId: string,
    personId: string,
    role: FamilyMembership["role"],
  ): Promise<void> {
    await updateItem(keys.family.pk(familyId), keys.family.sk.member(personId), {
      role,
    });
  }

  async delete(familyId: string, personId: string): Promise<void> {
    await deleteItem(keys.family.pk(familyId), keys.family.sk.member(personId));
  }

  async countActiveMembers(familyId: string): Promise<number> {
    const result = await queryItems("PK", keys.family.pk(familyId), keys.prefix.member);
    return result.items.length;
  }

  private toEntity(item: Record<string, unknown>): FamilyMembership {
    return {
      familyId: item["familyId"] as string,
      personId: item["personId"] as string,
      userId: item["userId"] as string,
      role: item["role"] as FamilyMembership["role"],
      joinedAt: item["joinedAt"] as string,
    };
  }
}
