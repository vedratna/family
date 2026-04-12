import type { Invitation } from "@family-app/shared";

import type { IInvitationRepository } from "../interfaces/invitation-repo";

import { keys } from "./keys";
import { getItem, putItem, queryItems, updateItem } from "./operations";

export class DynamoInvitationRepository implements IInvitationRepository {
  async create(invitation: Invitation): Promise<void> {
    await putItem({
      PK: keys.family.pk(invitation.familyId),
      SK: keys.family.sk.invite(invitation.phone),
      GSI1PK: keys.gsi1.phone(invitation.phone),
      GSI1SK: `INVITE#${invitation.familyId}`,
      familyId: invitation.familyId,
      phone: invitation.phone,
      invitedBy: invitation.invitedBy,
      relationshipToInviter: invitation.relationshipToInviter,
      inverseRelationshipLabel: invitation.inverseRelationshipLabel,
      role: invitation.role,
      status: invitation.status,
      createdAt: invitation.createdAt,
      entityType: "Invitation",
    });
  }

  async getByFamilyAndPhone(familyId: string, phone: string): Promise<Invitation | undefined> {
    const item = await getItem(keys.family.pk(familyId), keys.family.sk.invite(phone));
    if (item === undefined) {
      return undefined;
    }
    return this.toEntity(item);
  }

  async getByPhone(phone: string): Promise<Invitation[]> {
    const result = await queryItems("GSI1PK", keys.gsi1.phone(phone), keys.prefix.invite, {
      indexName: "GSI1",
    });
    return result.items.map((item) => this.toEntity(item));
  }

  async updateStatus(familyId: string, phone: string, status: Invitation["status"]): Promise<void> {
    await updateItem(keys.family.pk(familyId), keys.family.sk.invite(phone), {
      status,
    });
  }

  private toEntity(item: Record<string, unknown>): Invitation {
    return {
      familyId: item["familyId"] as string,
      phone: item["phone"] as string,
      invitedBy: item["invitedBy"] as string,
      relationshipToInviter: item["relationshipToInviter"] as string,
      inverseRelationshipLabel: item["inverseRelationshipLabel"] as string,
      role: item["role"] as Invitation["role"],
      status: item["status"] as Invitation["status"],
      createdAt: item["createdAt"] as string,
    };
  }
}
