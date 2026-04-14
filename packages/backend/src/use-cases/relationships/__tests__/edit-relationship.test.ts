import { describe, it, expect, vi } from "vitest";

import { NotFoundError, PermissionDeniedError } from "../../../domain/errors";
import type { IRelationshipRepository } from "../../../repositories/interfaces/relationship-repo";
import { EditRelationship, DeleteRelationship } from "../edit-relationship";

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

describe("EditRelationship", () => {
  it("updates relationship fields", async () => {
    const repo = mockRelRepo();
    vi.mocked(repo.getById).mockResolvedValue({
      id: "r1",
      familyId: "f1",
      personAId: "p1",
      personBId: "p2",
      aToBLabel: "father",
      bToALabel: "son",
      type: "parent-child",
      status: "confirmed",
      createdAt: "",
    });

    const uc = new EditRelationship(repo);
    await uc.execute({
      familyId: "f1",
      personAId: "p1",
      personBId: "p2",
      aToBLabel: "dad",
      bToALabel: "child",
      type: "parent-child",
      requesterRole: "admin",
    });

    expect(repo.update).toHaveBeenCalledWith("f1", "p1", "p2", {
      aToBLabel: "dad",
      bToALabel: "child",
      type: "parent-child",
    });
  });

  it("throws NotFoundError if relationship not found", async () => {
    const repo = mockRelRepo();
    vi.mocked(repo.getById).mockResolvedValue(undefined);

    const uc = new EditRelationship(repo);
    await expect(
      uc.execute({ familyId: "f1", personAId: "p1", personBId: "p2", requesterRole: "admin" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws PermissionDeniedError for non-admin", async () => {
    const repo = mockRelRepo();
    const uc = new EditRelationship(repo);

    await expect(
      uc.execute({ familyId: "f1", personAId: "p1", personBId: "p2", requesterRole: "editor" }),
    ).rejects.toThrow(PermissionDeniedError);
  });
});

describe("DeleteRelationship", () => {
  it("deletes a relationship", async () => {
    const repo = mockRelRepo();
    const uc = new DeleteRelationship(repo);

    await uc.execute("f1", "p1", "p2", "admin");

    expect(repo.delete).toHaveBeenCalledWith("f1", "p1", "p2");
  });

  it("throws PermissionDeniedError for non-admin", async () => {
    const repo = mockRelRepo();
    const uc = new DeleteRelationship(repo);

    await expect(uc.execute("f1", "p1", "p2", "editor")).rejects.toThrow(PermissionDeniedError);
  });
});
