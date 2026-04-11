import type { FamilyMembership, Person } from "@family-app/shared";

import { NotFoundError } from "../../domain/errors";
import type { IInvitationRepository } from "../../repositories/interfaces/invitation-repo";
import type { IMembershipRepository } from "../../repositories/interfaces/membership-repo";
import type { IPersonRepository } from "../../repositories/interfaces/person-repo";

interface AcceptInvitationInput {
  familyId: string;
  phone: string;
  userId: string;
  displayName: string;
}

interface AcceptInvitationResult {
  person: Person;
  membership: FamilyMembership;
}

export class AcceptInvitation {
  constructor(
    private readonly invitationRepo: IInvitationRepository,
    private readonly personRepo: IPersonRepository,
    private readonly membershipRepo: IMembershipRepository,
  ) {}

  async execute(input: AcceptInvitationInput): Promise<AcceptInvitationResult> {
    const invitation = await this.invitationRepo.getByFamilyAndPhone(input.familyId, input.phone);
    if (invitation === undefined) {
      throw new NotFoundError("Invitation", `${input.familyId}/${input.phone}`);
    }

    const personId = crypto.randomUUID();
    const now = new Date().toISOString();

    const person: Person = {
      id: personId,
      familyId: input.familyId,
      userId: input.userId,
      name: input.displayName,
      createdAt: now,
    };

    const membership: FamilyMembership = {
      familyId: input.familyId,
      personId,
      userId: input.userId,
      role: invitation.role,
      joinedAt: now,
    };

    await this.personRepo.create(person);
    await this.membershipRepo.create(membership);
    await this.invitationRepo.updateStatus(input.familyId, input.phone, "accepted");

    return { person, membership };
  }
}
