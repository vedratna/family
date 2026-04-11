import { ActivationGateError } from "../../domain/errors";
import type { IMembershipRepository } from "../../repositories/interfaces/membership-repo";

const MINIMUM_ACTIVE_MEMBERS = 2;

export class CheckActivationGate {
  constructor(private readonly membershipRepo: IMembershipRepository) {}

  async execute(familyId: string): Promise<void> {
    const count = await this.membershipRepo.countActiveMembers(familyId);
    if (count < MINIMUM_ACTIVE_MEMBERS) {
      throw new ActivationGateError();
    }
  }
}
