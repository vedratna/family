import { describe, it, expect, vi } from "vitest";

import { NotFoundError, PermissionDeniedError } from "../../../domain/errors";
import type { IFamilyRepository } from "../../../repositories/interfaces/family-repo";
import { UpdateFamilyTheme } from "../update-family-theme";

function mockFamilyRepo(): IFamilyRepository {
  return { create: vi.fn(), getById: vi.fn(), updateTheme: vi.fn(), delete: vi.fn() };
}

describe("UpdateFamilyTheme", () => {
  it("updates the family theme", async () => {
    const repo = mockFamilyRepo();
    vi.mocked(repo.getById).mockResolvedValue({
      id: "f1",
      name: "Sharma",
      themeName: "teal",
      createdBy: "u1",
      createdAt: "",
    });

    const uc = new UpdateFamilyTheme(repo);
    await uc.execute({ familyId: "f1", themeName: "coral", requesterRole: "admin" });

    expect(repo.updateTheme).toHaveBeenCalledWith("f1", "coral");
  });

  it("throws NotFoundError if family does not exist", async () => {
    const repo = mockFamilyRepo();
    vi.mocked(repo.getById).mockResolvedValue(undefined);

    const uc = new UpdateFamilyTheme(repo);
    await expect(
      uc.execute({ familyId: "f-missing", themeName: "coral", requesterRole: "admin" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws PermissionDeniedError for non-admin role", async () => {
    const repo = mockFamilyRepo();
    const uc = new UpdateFamilyTheme(repo);

    await expect(
      uc.execute({ familyId: "f1", themeName: "coral", requesterRole: "editor" }),
    ).rejects.toThrow(PermissionDeniedError);
  });
});
