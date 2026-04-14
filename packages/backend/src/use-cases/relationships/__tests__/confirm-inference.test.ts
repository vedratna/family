import { describe, it, expect, vi } from "vitest";

import { NotFoundError, PermissionDeniedError } from "../../../domain/errors";
import type { IRelationshipRepository } from "../../../repositories/interfaces/relationship-repo";
import { ConfirmInference, RejectInference } from "../confirm-inference";

function mockRelRepo(): IRelationshipRepository {
  return {
    create: vi.fn(),
    getByFamily: vi.fn(),
    getByPerson: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getPending: vi.fn(),
  };
}

describe("ConfirmInference", () => {
  it("confirms an inferred relationship", async () => {
    const repo = mockRelRepo();
    vi.mocked(repo.getById).mockResolvedValue({
      id: "r1",
      familyId: "f1",
      personAId: "p1",
      personBId: "p2",
      aToBLabel: "father",
      bToALabel: "son",
      type: "parent-child",
      status: "pending",
      createdAt: "",
    });

    const uc = new ConfirmInference(repo);
    await uc.execute("f1", "p1", "p2", "admin");

    expect(repo.update).toHaveBeenCalledWith("f1", "p1", "p2", { status: "confirmed" });
  });

  it("throws NotFoundError if relationship not found", async () => {
    const repo = mockRelRepo();
    vi.mocked(repo.getById).mockResolvedValue(undefined);

    const uc = new ConfirmInference(repo);
    await expect(uc.execute("f1", "p1", "p2", "admin")).rejects.toThrow(NotFoundError);
  });

  it("throws PermissionDeniedError for non-admin", async () => {
    const repo = mockRelRepo();
    const uc = new ConfirmInference(repo);

    await expect(uc.execute("f1", "p1", "p2", "editor")).rejects.toThrow(PermissionDeniedError);
  });
});

describe("RejectInference", () => {
  it("deletes the inferred relationship", async () => {
    const repo = mockRelRepo();
    const uc = new RejectInference(repo);

    await uc.execute("f1", "p1", "p2", "admin");

    expect(repo.delete).toHaveBeenCalledWith("f1", "p1", "p2");
  });

  it("throws PermissionDeniedError for non-admin", async () => {
    const repo = mockRelRepo();
    const uc = new RejectInference(repo);

    await expect(uc.execute("f1", "p1", "p2", "viewer")).rejects.toThrow(PermissionDeniedError);
  });
});
