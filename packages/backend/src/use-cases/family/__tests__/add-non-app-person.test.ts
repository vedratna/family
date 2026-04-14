import { describe, it, expect, vi } from "vitest";

import { PermissionDeniedError } from "../../../domain/errors";
import type { IPersonRepository } from "../../../repositories/interfaces/person-repo";
import { AddNonAppPerson } from "../add-non-app-person";

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

describe("AddNonAppPerson", () => {
  it("creates a person without a userId", async () => {
    const repo = mockPersonRepo();
    const uc = new AddNonAppPerson(repo);

    const result = await uc.execute({ familyId: "f1", name: "Grandma", requesterRole: "admin" });

    expect(result.familyId).toBe("f1");
    expect(result.name).toBe("Grandma");
    expect(result.userId).toBeUndefined();
    expect(repo.create).toHaveBeenCalledOnce();
  });

  it("throws PermissionDeniedError for non-admin role", async () => {
    const repo = mockPersonRepo();
    const uc = new AddNonAppPerson(repo);

    await expect(
      uc.execute({ familyId: "f1", name: "Grandma", requesterRole: "editor" }),
    ).rejects.toThrow(PermissionDeniedError);
  });
});
