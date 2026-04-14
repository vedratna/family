import { describe, it, expect, vi } from "vitest";

import { NotFoundError } from "../../../domain/errors";
import type { IInvitationRepository } from "../../../repositories/interfaces/invitation-repo";
import type { IMembershipRepository } from "../../../repositories/interfaces/membership-repo";
import type { INotificationPreferenceRepository } from "../../../repositories/interfaces/notification-repo";
import type { IPersonRepository } from "../../../repositories/interfaces/person-repo";
import { AcceptInvitation } from "../accept-invitation";

function mockInvitationRepo(): IInvitationRepository {
  return {
    create: vi.fn(),
    getByFamilyAndPhone: vi.fn(),
    getByPhone: vi.fn(),
    updateStatus: vi.fn(),
  };
}

function mockPersonRepo(): IPersonRepository {
  return {
    create: vi.fn(),
    getById: vi.fn(),
    getByFamilyId: vi.fn(),
    getByUserId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
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

function mockNotifPrefRepo(): INotificationPreferenceRepository {
  return {
    getByUser: vi.fn(),
    getByUserAndFamily: vi.fn(),
    upsert: vi.fn(),
    setDefaults: vi.fn(),
  };
}

describe("AcceptInvitation", () => {
  it("creates person, membership, updates invitation and sets notification defaults", async () => {
    const invRepo = mockInvitationRepo();
    const personRepo = mockPersonRepo();
    const memberRepo = mockMembershipRepo();
    const notifRepo = mockNotifPrefRepo();

    vi.mocked(invRepo.getByFamilyAndPhone).mockResolvedValue({
      familyId: "f1",
      phone: "+1234567890",
      invitedBy: "p-inviter",
      role: "editor",
      relationshipToInviter: "brother",
      inverseRelationshipLabel: "sibling",
      status: "pending",
      createdAt: "2025-01-01T00:00:00Z",
    });

    const uc = new AcceptInvitation(invRepo, personRepo, memberRepo, notifRepo);
    const result = await uc.execute({
      familyId: "f1",
      phone: "+1234567890",
      userId: "u1",
      displayName: "Bob",
    });

    expect(result.person.name).toBe("Bob");
    expect(result.person.userId).toBe("u1");
    expect(result.membership.role).toBe("editor");
    expect(personRepo.create).toHaveBeenCalledOnce();
    expect(memberRepo.create).toHaveBeenCalledOnce();
    expect(invRepo.updateStatus).toHaveBeenCalledWith("f1", "+1234567890", "accepted");
    expect(notifRepo.setDefaults).toHaveBeenCalledWith("u1", "f1");
  });

  it("throws NotFoundError when invitation does not exist", async () => {
    const invRepo = mockInvitationRepo();
    vi.mocked(invRepo.getByFamilyAndPhone).mockResolvedValue(undefined);

    const uc = new AcceptInvitation(
      invRepo,
      mockPersonRepo(),
      mockMembershipRepo(),
      mockNotifPrefRepo(),
    );
    await expect(
      uc.execute({ familyId: "f1", phone: "+0000000000", userId: "u1", displayName: "X" }),
    ).rejects.toThrow(NotFoundError);
  });
});
