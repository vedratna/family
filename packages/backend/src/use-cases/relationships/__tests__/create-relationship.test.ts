import { describe, it, expect, beforeEach, vi } from "vitest";

import { PermissionDeniedError } from "../../../domain/errors";
import type { IRelationshipRepository } from "../../../repositories/interfaces/relationship-repo";
import { CreateRelationship } from "../create-relationship";

function mockRepo(): IRelationshipRepository {
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

describe("CreateRelationship", () => {
  let repo: IRelationshipRepository;
  let useCase: CreateRelationship;

  beforeEach(() => {
    repo = mockRepo();
    useCase = new CreateRelationship(repo);
  });

  it("creates a confirmed relationship with bi-directional labels", async () => {
    const result = await useCase.execute({
      familyId: "fam-1",
      personAId: "grandma",
      personBId: "rajesh",
      aToBLabel: "Mother",
      bToALabel: "Son",
      type: "parent-child",
      requesterRole: "admin",
    });

    expect(result.aToBLabel).toBe("Mother");
    expect(result.bToALabel).toBe("Son");
    expect(result.type).toBe("parent-child");
    expect(result.status).toBe("confirmed");
    expect(repo.create).toHaveBeenCalledOnce();
  });

  it("rejects when editor tries to create", async () => {
    await expect(
      useCase.execute({
        familyId: "fam-1",
        personAId: "a",
        personBId: "b",
        aToBLabel: "X",
        bToALabel: "Y",
        type: "custom",
        requesterRole: "editor",
      }),
    ).rejects.toThrow(PermissionDeniedError);
  });
});
