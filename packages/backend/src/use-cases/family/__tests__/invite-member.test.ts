import type { Family } from "@family-app/shared";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { NotFoundError, PermissionDeniedError } from "../../../domain/errors";
import type { IFamilyRepository } from "../../../repositories/interfaces/family-repo";
import type { IInvitationRepository } from "../../../repositories/interfaces/invitation-repo";
import type { IMembershipRepository } from "../../../repositories/interfaces/membership-repo";
import { InviteMember } from "../invite-member";

function mockFamilyRepo(): IFamilyRepository {
  return { create: vi.fn(), getById: vi.fn(), updateTheme: vi.fn(), delete: vi.fn() };
}
function mockMembershipRepo(): IMembershipRepository {
  return {
    create: vi.fn(),
    getByFamilyId: vi.fn(),
    getByUserId: vi.fn(),
    getByFamilyAndPerson: vi.fn(),
    updateRole: vi.fn(),
    delete: vi.fn(),
    countActiveMembers: vi.fn(),
  };
}
function mockInvitationRepo(): IInvitationRepository {
  return {
    create: vi.fn(),
    getByFamilyAndPhone: vi.fn(),
    getByPhone: vi.fn(),
    updateStatus: vi.fn(),
  };
}

const family: Family = {
  id: "fam-1",
  name: "Sharma",
  createdBy: "u1",
  themeName: "teal",
  createdAt: "2026-01-01T00:00:00Z",
};

describe("InviteMember", () => {
  let useCase: InviteMember;
  let familyRepo: IFamilyRepository;
  let invitationRepo: IInvitationRepository;

  beforeEach(() => {
    familyRepo = mockFamilyRepo();
    const membershipRepo = mockMembershipRepo();
    invitationRepo = mockInvitationRepo();
    useCase = new InviteMember(familyRepo, membershipRepo, invitationRepo);
  });

  it("creates invitation when admin invites", async () => {
    vi.mocked(familyRepo.getById).mockResolvedValue(family);

    const result = await useCase.execute({
      familyId: "fam-1",
      inviterPersonId: "person-1",
      inviterRole: "admin",
      phone: "+919876543210",
      name: "Rajesh",
      relationshipToInviter: "Husband",
      inverseRelationshipLabel: "Wife",
      role: "editor",
    });

    expect(result.invitation.phone).toBe("+919876543210");
    expect(result.invitation.status).toBe("pending");
    expect(invitationRepo.create).toHaveBeenCalledOnce();
  });

  it("rejects when editor tries to invite", async () => {
    await expect(
      useCase.execute({
        familyId: "fam-1",
        inviterPersonId: "person-1",
        inviterRole: "editor",
        phone: "+919876543210",
        name: "Rajesh",
        relationshipToInviter: "Husband",
        inverseRelationshipLabel: "Wife",
        role: "editor",
      }),
    ).rejects.toThrow(PermissionDeniedError);
  });

  it("rejects when family not found", async () => {
    vi.mocked(familyRepo.getById).mockResolvedValue(undefined);

    await expect(
      useCase.execute({
        familyId: "nonexistent",
        inviterPersonId: "person-1",
        inviterRole: "owner",
        phone: "+919876543210",
        name: "Rajesh",
        relationshipToInviter: "Husband",
        inverseRelationshipLabel: "Wife",
        role: "editor",
      }),
    ).rejects.toThrow(NotFoundError);
  });
});
