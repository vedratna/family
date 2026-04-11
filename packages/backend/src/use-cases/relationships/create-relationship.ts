import type { Relationship, RelationshipType, Role } from "@family-app/shared";

import type { IRelationshipRepository } from "../../repositories/interfaces/relationship-repo";
import { requireRole } from "../../shared/permission-check";

interface CreateRelationshipInput {
  familyId: string;
  personAId: string;
  personBId: string;
  aToBLabel: string;
  bToALabel: string;
  type: RelationshipType;
  requesterRole: Role;
}

export class CreateRelationship {
  constructor(private readonly relationshipRepo: IRelationshipRepository) {}

  async execute(input: CreateRelationshipInput): Promise<Relationship> {
    requireRole(input.requesterRole, "admin", "create relationships");

    const relationship: Relationship = {
      id: crypto.randomUUID(),
      familyId: input.familyId,
      personAId: input.personAId,
      personBId: input.personBId,
      aToBLabel: input.aToBLabel,
      bToALabel: input.bToALabel,
      type: input.type,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    await this.relationshipRepo.create(relationship);

    return relationship;
  }
}
