import type { Role } from "@family-app/shared";

import { NotFoundError } from "../../domain/errors";
import type { IRelationshipRepository } from "../../repositories/interfaces/relationship-repo";
import { requireRole } from "../../shared/permission-check";

export class ConfirmInference {
  constructor(private readonly relationshipRepo: IRelationshipRepository) {}

  async execute(
    familyId: string,
    personAId: string,
    personBId: string,
    requesterRole: Role,
  ): Promise<void> {
    requireRole(requesterRole, "admin", "confirm inferred relationships");

    const rel = await this.relationshipRepo.getById(familyId, personAId, personBId);
    if (rel === undefined) {
      throw new NotFoundError("Relationship", `${personAId}-${personBId}`);
    }

    await this.relationshipRepo.update(familyId, personAId, personBId, { status: "confirmed" });
  }
}

export class RejectInference {
  constructor(private readonly relationshipRepo: IRelationshipRepository) {}

  async execute(
    familyId: string,
    personAId: string,
    personBId: string,
    requesterRole: Role,
  ): Promise<void> {
    requireRole(requesterRole, "admin", "reject inferred relationships");

    await this.relationshipRepo.delete(familyId, personAId, personBId);
  }
}
