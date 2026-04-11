import { describe, it, expect, beforeEach, vi } from "vitest";

import type { IFamilyRepository } from "../../../repositories/interfaces/family-repo";
import type { IMembershipRepository } from "../../../repositories/interfaces/membership-repo";
import type { IPersonRepository } from "../../../repositories/interfaces/person-repo";
import { CreateFamily } from "../create-family";

function mockFamilyRepo(): IFamilyRepository {
  return { create: vi.fn(), getById: vi.fn(), updateTheme: vi.fn(), delete: vi.fn() };
}
function mockPersonRepo(): IPersonRepository {
  return { create: vi.fn(), getById: vi.fn(), getByFamilyId: vi.fn(), getByUserId: vi.fn(), update: vi.fn(), delete: vi.fn() };
}
function mockMembershipRepo(): IMembershipRepository {
  return { create: vi.fn(), getByFamilyId: vi.fn(), getByUserId: vi.fn(), getByFamilyAndPerson: vi.fn(), updateRole: vi.fn(), delete: vi.fn(), countActiveMembers: vi.fn() };
}

describe("CreateFamily", () => {
  let useCase: CreateFamily;
  let familyRepo: IFamilyRepository;
  let personRepo: IPersonRepository;
  let membershipRepo: IMembershipRepository;

  beforeEach(() => {
    familyRepo = mockFamilyRepo();
    personRepo = mockPersonRepo();
    membershipRepo = mockMembershipRepo();
    useCase = new CreateFamily(familyRepo, personRepo, membershipRepo);
  });

  it("creates family, person, and owner membership", async () => {
    const result = await useCase.execute({
      name: "Sharma Family",
      themeName: "teal",
      userId: "user-1",
      displayName: "Priya",
    });

    expect(result.family.name).toBe("Sharma Family");
    expect(result.family.themeName).toBe("teal");
    expect(result.family.createdBy).toBe("user-1");
    expect(result.person.name).toBe("Priya");
    expect(result.person.userId).toBe("user-1");
    expect(result.membership.role).toBe("owner");
    expect(result.membership.userId).toBe("user-1");

    expect(familyRepo.create).toHaveBeenCalledOnce();
    expect(personRepo.create).toHaveBeenCalledOnce();
    expect(membershipRepo.create).toHaveBeenCalledOnce();
  });

  it("generates unique IDs for family and person", async () => {
    const result1 = await useCase.execute({ name: "F1", themeName: "teal", userId: "u1", displayName: "A" });
    const result2 = await useCase.execute({ name: "F2", themeName: "coral", userId: "u2", displayName: "B" });

    expect(result1.family.id).not.toBe(result2.family.id);
    expect(result1.person.id).not.toBe(result2.person.id);
  });
});
