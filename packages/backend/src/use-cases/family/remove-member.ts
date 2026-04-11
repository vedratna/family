import type { Role } from "@family-app/shared";

import { NotFoundError, PermissionDeniedError } from "../../domain/errors";
import type { IMembershipRepository } from "../../repositories/interfaces/membership-repo";
import { requireRole } from "../../shared/permission-check";

interface RemoveMemberInput {
  familyId: string;
  targetPersonId: string;
  requesterRole: Role;
}

export class RemoveMember {
  constructor(private readonly membershipRepo: IMembershipRepository) {}

  async execute(input: RemoveMemberInput): Promise<void> {
    requireRole(input.requesterRole, "admin", "remove members");

    const membership = await this.membershipRepo.getByFamilyAndPerson(
      input.familyId,
      input.targetPersonId,
    );
    if (membership === undefined) {
      throw new NotFoundError("Membership", input.targetPersonId);
    }

    if (membership.role === "owner") {
      throw new PermissionDeniedError("Cannot remove the owner. Transfer ownership first.");
    }

    // Delete membership only — Person record and relationships are preserved in the tree
    await this.membershipRepo.delete(input.familyId, input.targetPersonId);
  }
}
