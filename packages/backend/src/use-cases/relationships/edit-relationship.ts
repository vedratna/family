import type { RelationshipType, Role } from "@family-app/shared";

import { NotFoundError } from "../../domain/errors";
import type { IRelationshipRepository } from "../../repositories/interfaces/relationship-repo";
import { requireRole } from "../../shared/permission-check";

interface EditRelationshipInput {
  familyId: string;
  personAId: string;
  personBId: string;
  aToBLabel?: string;
  bToALabel?: string;
  type?: RelationshipType;
  requesterRole: Role;
}

export class EditRelationship {
  constructor(private readonly relationshipRepo: IRelationshipRepository) {}

  async execute(input: EditRelationshipInput): Promise<void> {
    requireRole(input.requesterRole, "admin", "edit relationships");

    const existing = await this.relationshipRepo.getById(
      input.familyId,
      input.personAId,
      input.personBId,
    );
    if (existing === undefined) {
      throw new NotFoundError("Relationship", `${input.personAId}-${input.personBId}`);
    }

    const updates: Record<string, string> = {};
    if (input.aToBLabel !== undefined) {
      updates["aToBLabel"] = input.aToBLabel;
    }
    if (input.bToALabel !== undefined) {
      updates["bToALabel"] = input.bToALabel;
    }
    if (input.type !== undefined) {
      updates["type"] = input.type;
    }

    await this.relationshipRepo.update(input.familyId, input.personAId, input.personBId, updates);
  }
}

export class DeleteRelationship {
  constructor(private readonly relationshipRepo: IRelationshipRepository) {}

  async execute(
    familyId: string,
    personAId: string,
    personBId: string,
    requesterRole: Role,
  ): Promise<void> {
    requireRole(requesterRole, "admin", "delete relationships");

    await this.relationshipRepo.delete(familyId, personAId, personBId);
  }
}
