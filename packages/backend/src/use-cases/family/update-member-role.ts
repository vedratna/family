import type { Role } from "@family-app/shared";

import { NotFoundError, PermissionDeniedError } from "../../domain/errors";
import type { IMembershipRepository } from "../../repositories/interfaces/membership-repo";
import { requireRole } from "../../shared/permission-check";

interface UpdateMemberRoleInput {
  familyId: string;
  targetPersonId: string;
  newRole: Role;
  requesterRole: Role;
}

export class UpdateMemberRole {
  constructor(private readonly membershipRepo: IMembershipRepository) {}

  async execute(input: UpdateMemberRoleInput): Promise<void> {
    requireRole(input.requesterRole, "admin", "update member roles");

    if (input.newRole === "owner") {
      throw new PermissionDeniedError("Cannot assign owner role directly. Use transfer ownership.");
    }

    const membership = await this.membershipRepo.getByFamilyAndPerson(
      input.familyId,
      input.targetPersonId,
    );
    if (membership === undefined) {
      throw new NotFoundError("Membership", input.targetPersonId);
    }

    if (membership.role === "owner") {
      throw new PermissionDeniedError("Cannot change the owner's role. Use transfer ownership.");
    }

    await this.membershipRepo.updateRole(input.familyId, input.targetPersonId, input.newRole);
  }
}
