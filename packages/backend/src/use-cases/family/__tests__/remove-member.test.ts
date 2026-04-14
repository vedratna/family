import { describe, it, expect, vi } from "vitest";

import { NotFoundError, PermissionDeniedError } from "../../../domain/errors";
import type { IMembershipRepository } from "../../../repositories/interfaces/membership-repo";
import { RemoveMember } from "../remove-member";

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

describe("RemoveMember", () => {
  it("removes a non-owner member", async () => {
    const repo = mockMembershipRepo();
    vi.mocked(repo.getByFamilyAndPerson).mockResolvedValue({
      familyId: "f1",
      personId: "p2",
      userId: "u2",
      role: "editor",
      joinedAt: "",
    });

    const uc = new RemoveMember(repo);
    await uc.execute({ familyId: "f1", targetPersonId: "p2", requesterRole: "admin" });

    expect(repo.delete).toHaveBeenCalledWith("f1", "p2");
  });

  it("throws NotFoundError if membership does not exist", async () => {
    const repo = mockMembershipRepo();
    vi.mocked(repo.getByFamilyAndPerson).mockResolvedValue(undefined);

    const uc = new RemoveMember(repo);
    await expect(
      uc.execute({ familyId: "f1", targetPersonId: "p2", requesterRole: "admin" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws PermissionDeniedError when trying to remove the owner", async () => {
    const repo = mockMembershipRepo();
    vi.mocked(repo.getByFamilyAndPerson).mockResolvedValue({
      familyId: "f1",
      personId: "p1",
      userId: "u1",
      role: "owner",
      joinedAt: "",
    });

    const uc = new RemoveMember(repo);
    await expect(
      uc.execute({ familyId: "f1", targetPersonId: "p1", requesterRole: "admin" }),
    ).rejects.toThrow(PermissionDeniedError);
  });

  it("throws PermissionDeniedError for non-admin requester", async () => {
    const repo = mockMembershipRepo();
    const uc = new RemoveMember(repo);

    await expect(
      uc.execute({ familyId: "f1", targetPersonId: "p2", requesterRole: "editor" }),
    ).rejects.toThrow(PermissionDeniedError);
  });
});
