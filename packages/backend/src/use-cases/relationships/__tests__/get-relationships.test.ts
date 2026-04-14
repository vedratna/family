import type { Relationship } from "@family-app/shared";
import { describe, it, expect, vi } from "vitest";

import type { IRelationshipRepository } from "../../../repositories/interfaces/relationship-repo";
import { GetRelationships } from "../get-relationships";

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

describe("GetRelationships", () => {
  describe("forPerson", () => {
    it("returns perspective relationships for personA", async () => {
      const repo = mockRelRepo();
      const rel: Relationship = {
        id: "r1",
        familyId: "f1",
        personAId: "p1",
        personBId: "p2",
        aToBLabel: "father of",
        bToALabel: "son of",
        type: "parent-child",
        status: "confirmed",
        createdAt: "",
      };
      vi.mocked(repo.getByPerson).mockResolvedValue([rel]);

      const uc = new GetRelationships(repo);
      const result = await uc.forPerson("f1", "p1");

      expect(result).toHaveLength(1);
      expect(result[0]!.label).toBe("son of"); // bToALabel when person is A
      expect(result[0]!.otherPersonId).toBe("p2");
    });

    it("returns perspective relationships for personB", async () => {
      const repo = mockRelRepo();
      const rel: Relationship = {
        id: "r1",
        familyId: "f1",
        personAId: "p1",
        personBId: "p2",
        aToBLabel: "father of",
        bToALabel: "son of",
        type: "parent-child",
        status: "confirmed",
        createdAt: "",
      };
      vi.mocked(repo.getByPerson).mockResolvedValue([rel]);

      const uc = new GetRelationships(repo);
      const result = await uc.forPerson("f1", "p2");

      expect(result).toHaveLength(1);
      expect(result[0]!.label).toBe("father of"); // aToBLabel when person is B
      expect(result[0]!.otherPersonId).toBe("p1");
    });
  });

  describe("forFamily", () => {
    it("delegates to repo.getByFamily", async () => {
      const repo = mockRelRepo();
      const rels: Relationship[] = [
        {
          id: "r1",
          familyId: "f1",
          personAId: "p1",
          personBId: "p2",
          aToBLabel: "a",
          bToALabel: "b",
          type: "spouse",
          status: "confirmed",
          createdAt: "",
        },
      ];
      vi.mocked(repo.getByFamily).mockResolvedValue(rels);

      const uc = new GetRelationships(repo);
      const result = await uc.forFamily("f1");

      expect(result).toEqual(rels);
    });
  });
});
