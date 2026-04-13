import type { Chore } from "@family-app/shared";
import { describe, it, expect, vi } from "vitest";

import { NotFoundError, PermissionDeniedError } from "../../../domain/errors";
import type { IChoreRepository } from "../../../repositories/interfaces/chore-repo";
import { DeleteChore } from "../delete-chore";

function mockChoreRepo(): IChoreRepository {
  return {
    create: vi.fn(),
    getById: vi.fn(),
    getByFamily: vi.fn(),
    getByAssignee: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

const chore: Chore = {
  id: "chore-1",
  familyId: "fam-1",
  title: "Take out trash",
  assigneePersonId: "person-1",
  status: "pending",
  createdAt: "2026-01-01T00:00:00Z",
};

describe("DeleteChore", () => {
  it("deletes an existing chore", async () => {
    const repo = mockChoreRepo();
    vi.mocked(repo.getById).mockResolvedValue(chore);
    const useCase = new DeleteChore(repo);

    await useCase.execute({ familyId: "fam-1", choreId: "chore-1", requesterRole: "editor" });

    expect(repo.delete).toHaveBeenCalledWith("fam-1", "chore-1");
  });

  it("throws NotFoundError if chore does not exist", async () => {
    const repo = mockChoreRepo();
    vi.mocked(repo.getById).mockResolvedValue(undefined);
    const useCase = new DeleteChore(repo);

    await expect(
      useCase.execute({ familyId: "fam-1", choreId: "missing", requesterRole: "editor" }),
    ).rejects.toThrow(NotFoundError);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it("rejects viewer role", async () => {
    const repo = mockChoreRepo();
    const useCase = new DeleteChore(repo);

    await expect(
      useCase.execute({ familyId: "fam-1", choreId: "chore-1", requesterRole: "viewer" }),
    ).rejects.toThrow(PermissionDeniedError);
    expect(repo.delete).not.toHaveBeenCalled();
  });
});
