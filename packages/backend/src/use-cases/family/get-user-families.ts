import type { Family, FamilyMembership } from "@family-app/shared";

import type { IFamilyRepository } from "../../repositories/interfaces/family-repo";
import type { IMembershipRepository } from "../../repositories/interfaces/membership-repo";

interface FamilyWithRole {
  family: Family;
  membership: FamilyMembership;
}

export class GetUserFamilies {
  constructor(
    private readonly membershipRepo: IMembershipRepository,
    private readonly familyRepo: IFamilyRepository,
  ) {}

  async execute(userId: string): Promise<FamilyWithRole[]> {
    const memberships = await this.membershipRepo.getByUserId(userId);

    const results: FamilyWithRole[] = [];
    for (const membership of memberships) {
      const family = await this.familyRepo.getById(membership.familyId);
      if (family !== undefined) {
        results.push({ family, membership });
      }
    }

    return results;
  }
}
