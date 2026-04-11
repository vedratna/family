import type { Chore } from "@family-app/shared";
import { describe, it, expect, vi } from "vitest";

import { NotFoundError } from "../../../domain/errors";
import type { IChoreRepository } from "../../../repositories/interfaces/chore-repo";
import { RotateChore } from "../rotate-chore";

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

function makeChore(overrides: Partial<Chore> = {}): Chore {
  return {
    id: "chore-1",
    familyId: "fam-1",
    title: "Take out trash",
    assigneePersonId: "person-1",
    status: "pending",
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("RotateChore", () => {
  it("rotates to next member in rotation", async () => {
    const repo = mockChoreRepo();
    vi.mocked(repo.getById).mockResolvedValue(
      makeChore({
        assigneePersonId: "person-1",
        rotationMembers: ["person-1", "person-2", "person-3"],
      }),
    );
    const useCase = new RotateChore(repo);

    const nextAssignee = await useCase.execute("fam-1", "chore-1");

    expect(nextAssignee).toBe("person-2");
    expect(repo.update).toHaveBeenCalledWith("fam-1", "chore-1", {
      assigneePersonId: "person-2",
      status: "pending",
    });
  });

  it("wraps around to first member after last", async () => {
    const repo = mockChoreRepo();
    vi.mocked(repo.getById).mockResolvedValue(
      makeChore({
        assigneePersonId: "person-3",
        rotationMembers: ["person-1", "person-2", "person-3"],
      }),
    );
    const useCase = new RotateChore(repo);

    const nextAssignee = await useCase.execute("fam-1", "chore-1");

    expect(nextAssignee).toBe("person-1");
  });

  it("returns current assignee when no rotation members", async () => {
    const repo = mockChoreRepo();
    vi.mocked(repo.getById).mockResolvedValue(makeChore());
    const useCase = new RotateChore(repo);

    const nextAssignee = await useCase.execute("fam-1", "chore-1");

    expect(nextAssignee).toBe("person-1");
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("throws NotFoundError for missing chore", async () => {
    const repo = mockChoreRepo();
    vi.mocked(repo.getById).mockResolvedValue(undefined);
    const useCase = new RotateChore(repo);

    await expect(useCase.execute("fam-1", "missing")).rejects.toThrow(NotFoundError);
  });
});
