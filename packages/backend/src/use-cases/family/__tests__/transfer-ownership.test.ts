import { describe, it, expect, vi } from "vitest";

import { NotFoundError, PermissionDeniedError } from "../../../domain/errors";
import type { IMembershipRepository } from "../../../repositories/interfaces/membership-repo";
import { TransferOwnership } from "../transfer-ownership";

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

describe("TransferOwnership", () => {
  it("transfers ownership from current owner to new owner", async () => {
    const repo = mockMembershipRepo();
    vi.mocked(repo.getByFamilyAndPerson).mockResolvedValue({
      familyId: "f1",
      personId: "p2",
      userId: "u2",
      role: "admin",
      joinedAt: "",
    });

    const uc = new TransferOwnership(repo);
    await uc.execute({
      familyId: "f1",
      currentOwnerPersonId: "p1",
      newOwnerPersonId: "p2",
      requesterRole: "owner",
    });

    expect(repo.updateRole).toHaveBeenCalledWith("f1", "p2", "owner");
    expect(repo.updateRole).toHaveBeenCalledWith("f1", "p1", "admin");
  });

  it("throws PermissionDeniedError if requester is not owner", async () => {
    const repo = mockMembershipRepo();
    const uc = new TransferOwnership(repo);

    await expect(
      uc.execute({
        familyId: "f1",
        currentOwnerPersonId: "p1",
        newOwnerPersonId: "p2",
        requesterRole: "admin",
      }),
    ).rejects.toThrow(PermissionDeniedError);
  });

  it("throws NotFoundError if new owner membership does not exist", async () => {
    const repo = mockMembershipRepo();
    vi.mocked(repo.getByFamilyAndPerson).mockResolvedValue(undefined);

    const uc = new TransferOwnership(repo);
    await expect(
      uc.execute({
        familyId: "f1",
        currentOwnerPersonId: "p1",
        newOwnerPersonId: "p-missing",
        requesterRole: "owner",
      }),
    ).rejects.toThrow(NotFoundError);
  });
});
