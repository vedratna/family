import type { FamilyMembership } from "@family-app/shared";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { NotFoundError, PermissionDeniedError } from "../../../domain/errors";
import type { IMembershipRepository } from "../../../repositories/interfaces/membership-repo";
import { UpdateMemberRole } from "../update-member-role";

function mockMembershipRepo(): IMembershipRepository {
  return { create: vi.fn(), getByFamilyId: vi.fn(), getByUserId: vi.fn(), getByFamilyAndPerson: vi.fn(), updateRole: vi.fn(), delete: vi.fn(), countActiveMembers: vi.fn() };
}

const editorMembership: FamilyMembership = {
  familyId: "fam-1", personId: "person-2", userId: "u2", role: "editor", joinedAt: "2026-01-01T00:00:00Z",
};

const ownerMembership: FamilyMembership = {
  familyId: "fam-1", personId: "person-1", userId: "u1", role: "owner", joinedAt: "2026-01-01T00:00:00Z",
};

describe("UpdateMemberRole", () => {
  let useCase: UpdateMemberRole;
  let membershipRepo: IMembershipRepository;

  beforeEach(() => {
    membershipRepo = mockMembershipRepo();
    useCase = new UpdateMemberRole(membershipRepo);
  });

  it("updates role from editor to admin", async () => {
    vi.mocked(membershipRepo.getByFamilyAndPerson).mockResolvedValue(editorMembership);

    await useCase.execute({
      familyId: "fam-1",
      targetPersonId: "person-2",
      newRole: "admin",
      requesterRole: "owner",
    });

    expect(membershipRepo.updateRole).toHaveBeenCalledWith("fam-1", "person-2", "admin");
  });

  it("rejects assigning owner role directly", async () => {
    await expect(
      useCase.execute({
        familyId: "fam-1",
        targetPersonId: "person-2",
        newRole: "owner",
        requesterRole: "owner",
      }),
    ).rejects.toThrow(PermissionDeniedError);
  });

  it("rejects changing owner's role", async () => {
    vi.mocked(membershipRepo.getByFamilyAndPerson).mockResolvedValue(ownerMembership);

    await expect(
      useCase.execute({
        familyId: "fam-1",
        targetPersonId: "person-1",
        newRole: "admin",
        requesterRole: "owner",
      }),
    ).rejects.toThrow(PermissionDeniedError);
  });

  it("rejects when editor tries to change roles", async () => {
    await expect(
      useCase.execute({
        familyId: "fam-1",
        targetPersonId: "person-2",
        newRole: "viewer",
        requesterRole: "editor",
      }),
    ).rejects.toThrow(PermissionDeniedError);
  });

  it("throws NotFoundError for nonexistent membership", async () => {
    vi.mocked(membershipRepo.getByFamilyAndPerson).mockResolvedValue(undefined);

    await expect(
      useCase.execute({
        familyId: "fam-1",
        targetPersonId: "nonexistent",
        newRole: "admin",
        requesterRole: "owner",
      }),
    ).rejects.toThrow(NotFoundError);
  });
});
