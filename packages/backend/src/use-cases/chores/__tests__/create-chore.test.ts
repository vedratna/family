import { describe, it, expect, vi } from "vitest";

import { PermissionDeniedError } from "../../../domain/errors";
import type { IChoreRepository } from "../../../repositories/interfaces/chore-repo";
import { CreateChore } from "../create-chore";

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

describe("CreateChore", () => {
  it("creates a chore with required fields", async () => {
    const repo = mockChoreRepo();
    const uc = new CreateChore(repo);

    const result = await uc.execute({
      familyId: "f1",
      title: "Dishes",
      assigneePersonId: "p1",
      requesterRole: "editor",
    });

    expect(result.familyId).toBe("f1");
    expect(result.title).toBe("Dishes");
    expect(result.assigneePersonId).toBe("p1");
    expect(result.status).toBe("pending");
    expect(repo.create).toHaveBeenCalledOnce();
  });

  it("includes optional fields when provided", async () => {
    const repo = mockChoreRepo();
    const uc = new CreateChore(repo);

    const result = await uc.execute({
      familyId: "f1",
      title: "Mow lawn",
      assigneePersonId: "p1",
      requesterRole: "admin",
      description: "Front and back yard",
      dueDate: "2025-06-01",
      recurrenceRule: "WEEKLY",
      rotationMembers: ["p1", "p2"],
    });

    expect(result.description).toBe("Front and back yard");
    expect(result.dueDate).toBe("2025-06-01");
    expect(result.recurrenceRule).toBe("WEEKLY");
    expect(result.rotationMembers).toEqual(["p1", "p2"]);
  });

  it("throws PermissionDeniedError for viewer role", async () => {
    const repo = mockChoreRepo();
    const uc = new CreateChore(repo);

    await expect(
      uc.execute({
        familyId: "f1",
        title: "Dishes",
        assigneePersonId: "p1",
        requesterRole: "viewer",
      }),
    ).rejects.toThrow(PermissionDeniedError);
  });
});
