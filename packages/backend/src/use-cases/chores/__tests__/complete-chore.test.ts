import { describe, it, expect, vi } from "vitest";

import { NotFoundError } from "../../../domain/errors";
import type { IChoreRepository } from "../../../repositories/interfaces/chore-repo";
import { CompleteChore } from "../complete-chore";

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

describe("CompleteChore", () => {
  it("marks a chore as completed", async () => {
    const repo = mockChoreRepo();
    vi.mocked(repo.getById).mockResolvedValue({
      id: "c1",
      familyId: "f1",
      title: "Dishes",
      assigneePersonId: "p1",
      status: "pending",
      createdAt: "2025-01-01T00:00:00Z",
    });

    const uc = new CompleteChore(repo);
    await uc.execute("f1", "c1");

    expect(repo.update).toHaveBeenCalledWith(
      "f1",
      "c1",
      expect.objectContaining({
        status: "completed",
      }),
    );
  });

  it("throws NotFoundError if chore does not exist", async () => {
    const repo = mockChoreRepo();
    vi.mocked(repo.getById).mockResolvedValue(undefined);

    const uc = new CompleteChore(repo);
    await expect(uc.execute("f1", "c1")).rejects.toThrow(NotFoundError);
  });
});
