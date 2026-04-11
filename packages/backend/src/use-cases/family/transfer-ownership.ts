import { NotFoundError, PermissionDeniedError } from "../../domain/errors";
import type { IMembershipRepository } from "../../repositories/interfaces/membership-repo";

interface TransferOwnershipInput {
  familyId: string;
  currentOwnerPersonId: string;
  newOwnerPersonId: string;
  requesterRole: string;
}

export class TransferOwnership {
  constructor(private readonly membershipRepo: IMembershipRepository) {}

  async execute(input: TransferOwnershipInput): Promise<void> {
    if (input.requesterRole !== "owner") {
      throw new PermissionDeniedError("Only the owner can transfer ownership.");
    }

    const newOwner = await this.membershipRepo.getByFamilyAndPerson(
      input.familyId,
      input.newOwnerPersonId,
    );
    if (newOwner === undefined) {
      throw new NotFoundError("Membership", input.newOwnerPersonId);
    }

    await this.membershipRepo.updateRole(input.familyId, input.newOwnerPersonId, "owner");
    await this.membershipRepo.updateRole(input.familyId, input.currentOwnerPersonId, "admin");
  }
}
