import type { Invitation, Role } from "@family-app/shared";

import { NotFoundError } from "../../domain/errors";
import type { IFamilyRepository } from "../../repositories/interfaces/family-repo";
import type { IInvitationRepository } from "../../repositories/interfaces/invitation-repo";
import type { IMembershipRepository } from "../../repositories/interfaces/membership-repo";
import { requireRole } from "../../shared/permission-check";

interface InviteMemberInput {
  familyId: string;
  inviterPersonId: string;
  inviterRole: Role;
  phone: string;
  name: string;
  relationshipToInviter: string;
  inverseRelationshipLabel: string;
  role: Role;
}

interface InviteMemberResult {
  invitation: Invitation;
}

export class InviteMember {
  constructor(
    private readonly familyRepo: IFamilyRepository,
    private readonly membershipRepo: IMembershipRepository,
    private readonly invitationRepo: IInvitationRepository,
  ) {}

  async execute(input: InviteMemberInput): Promise<InviteMemberResult> {
    requireRole(input.inviterRole, "admin", "invite members");

    const family = await this.familyRepo.getById(input.familyId);
    if (family === undefined) {
      throw new NotFoundError("Family", input.familyId);
    }

    const invitation: Invitation = {
      familyId: input.familyId,
      phone: input.phone,
      invitedBy: input.inviterPersonId,
      relationshipToInviter: input.relationshipToInviter,
      inverseRelationshipLabel: input.inverseRelationshipLabel,
      role: input.role,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await this.invitationRepo.create(invitation);

    return { invitation };
  }
}
