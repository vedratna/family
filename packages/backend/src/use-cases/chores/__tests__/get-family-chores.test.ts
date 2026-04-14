import { describe, it, expect, vi } from "vitest";

import type { IChoreRepository } from "../../../repositories/interfaces/chore-repo";
import { GetFamilyChores } from "../get-family-chores";

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

describe("GetFamilyChores", () => {
  it("returns all chores for a family when no filters", async () => {
    const repo = mockChoreRepo();
    const chores = [
      {
        id: "c1",
        familyId: "f1",
        title: "Dishes",
        assigneePersonId: "p1",
        status: "pending" as const,
        createdAt: "",
      },
    ];
    vi.mocked(repo.getByFamily).mockResolvedValue(chores);

    const uc = new GetFamilyChores(repo);
    const result = await uc.execute({ familyId: "f1" });

    expect(result).toEqual(chores);
    expect(repo.getByFamily).toHaveBeenCalledWith("f1");
  });

  it("filters by assignee when assigneePersonId provided", async () => {
    const repo = mockChoreRepo();
    const chores = [
      {
        id: "c1",
        familyId: "f1",
        title: "Dishes",
        assigneePersonId: "p1",
        status: "pending" as const,
        createdAt: "",
      },
    ];
    vi.mocked(repo.getByAssignee).mockResolvedValue(chores);

    const uc = new GetFamilyChores(repo);
    const result = await uc.execute({ familyId: "f1", assigneePersonId: "p1" });

    expect(result).toEqual(chores);
    expect(repo.getByAssignee).toHaveBeenCalledWith("f1", "p1");
  });

  it("filters by status when status provided", async () => {
    const repo = mockChoreRepo();
    const chores = [
      {
        id: "c1",
        familyId: "f1",
        title: "Dishes",
        assigneePersonId: "p1",
        status: "pending" as const,
        createdAt: "",
      },
      {
        id: "c2",
        familyId: "f1",
        title: "Laundry",
        assigneePersonId: "p2",
        status: "completed" as const,
        createdAt: "",
      },
    ];
    vi.mocked(repo.getByFamily).mockResolvedValue(chores);

    const uc = new GetFamilyChores(repo);
    const result = await uc.execute({ familyId: "f1", status: "pending" });

    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("c1");
  });
});
