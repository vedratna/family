import { describe, it, expect, vi } from "vitest";

import type { IFamilyRepository } from "../../../repositories/interfaces/family-repo";
import type { IMembershipRepository } from "../../../repositories/interfaces/membership-repo";
import { GetUserFamilies } from "../get-user-families";

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

function mockFamilyRepo(): IFamilyRepository {
  return { create: vi.fn(), getById: vi.fn(), updateTheme: vi.fn(), delete: vi.fn() };
}

describe("GetUserFamilies", () => {
  it("returns families with memberships for a user", async () => {
    const memberRepo = mockMembershipRepo();
    const familyRepo = mockFamilyRepo();

    vi.mocked(memberRepo.getByUserId).mockResolvedValue([
      { familyId: "f1", personId: "p1", userId: "u1", role: "owner", joinedAt: "" },
    ]);
    vi.mocked(familyRepo.getById).mockResolvedValue({
      id: "f1",
      name: "Sharma Family",
      themeName: "teal",
      createdBy: "u1",
      createdAt: "",
    });

    const uc = new GetUserFamilies(memberRepo, familyRepo);
    const result = await uc.execute("u1");

    expect(result).toHaveLength(1);
    expect(result[0]!.family.name).toBe("Sharma Family");
    expect(result[0]!.membership.role).toBe("owner");
  });

  it("skips memberships where family no longer exists", async () => {
    const memberRepo = mockMembershipRepo();
    const familyRepo = mockFamilyRepo();

    vi.mocked(memberRepo.getByUserId).mockResolvedValue([
      { familyId: "f-gone", personId: "p1", userId: "u1", role: "editor", joinedAt: "" },
    ]);
    vi.mocked(familyRepo.getById).mockResolvedValue(undefined);

    const uc = new GetUserFamilies(memberRepo, familyRepo);
    const result = await uc.execute("u1");

    expect(result).toHaveLength(0);
  });
});
