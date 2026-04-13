import type { Family, FamilyMembership, Person, ThemeName } from "@family-app/shared";

import type { IFamilyRepository } from "../../repositories/interfaces/family-repo";
import type { IMembershipRepository } from "../../repositories/interfaces/membership-repo";
import type { INotificationPreferenceRepository } from "../../repositories/interfaces/notification-repo";
import type { IPersonRepository } from "../../repositories/interfaces/person-repo";

interface CreateFamilyInput {
  name: string;
  themeName: ThemeName;
  userId: string;
  displayName: string;
}

interface CreateFamilyResult {
  family: Family;
  person: Person;
  membership: FamilyMembership;
}

export class CreateFamily {
  constructor(
    private readonly familyRepo: IFamilyRepository,
    private readonly personRepo: IPersonRepository,
    private readonly membershipRepo: IMembershipRepository,
    private readonly notifPrefRepo: INotificationPreferenceRepository,
  ) {}

  async execute(input: CreateFamilyInput): Promise<CreateFamilyResult> {
    const familyId = crypto.randomUUID();
    const personId = crypto.randomUUID();
    const now = new Date().toISOString();

    const family: Family = {
      id: familyId,
      name: input.name,
      createdBy: input.userId,
      themeName: input.themeName,
      createdAt: now,
    };

    const person: Person = {
      id: personId,
      familyId,
      userId: input.userId,
      name: input.displayName,
      createdAt: now,
    };

    const membership: FamilyMembership = {
      familyId,
      personId,
      userId: input.userId,
      role: "owner",
      joinedAt: now,
    };

    await this.familyRepo.create(family);
    await this.personRepo.create(person);
    await this.membershipRepo.create(membership);
    await this.notifPrefRepo.setDefaults(input.userId, familyId);

    return { family, person, membership };
  }
}
