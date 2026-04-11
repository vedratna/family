import type { Relationship } from "@family-app/shared";
import { describe, it, expect, vi } from "vitest";

import type { IRelationshipRepository } from "../../../repositories/interfaces/relationship-repo";
import { InferRelationships } from "../infer-relationships";

function mockRelationshipRepo(existing: Relationship[]): IRelationshipRepository {
  return {
    create: vi.fn(),
    getByFamily: vi.fn().mockResolvedValue(existing),
    getByPerson: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getPending: vi.fn(),
  };
}

function makeRel(
  overrides: Partial<Relationship> & Pick<Relationship, "personAId" | "personBId" | "type">,
): Relationship {
  return {
    id: crypto.randomUUID(),
    familyId: "fam-1",
    aToBLabel: "A",
    bToALabel: "B",
    status: "confirmed",
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("InferRelationships", () => {
  describe("parent-child inferences", () => {
    it("infers grandparent when parent's parent exists", async () => {
      const grandma = "grandma";
      const parent = "rajesh";
      const child = "amit";

      // Existing: grandma is parent of rajesh
      const existing = [
        makeRel({ personAId: grandma, personBId: parent, type: "parent-child" }),
      ];

      const repo = mockRelationshipRepo(existing);
      const useCase = new InferRelationships(repo);

      // New: rajesh is parent of amit
      const newRel = makeRel({ personAId: parent, personBId: child, type: "parent-child" });

      const suggestions = await useCase.execute("fam-1", newRel);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0]).toMatchObject({
        personAId: grandma,
        personBId: child,
        type: "grandparent-grandchild",
      });
    });

    it("infers uncle/aunt when parent has siblings", async () => {
      const parent = "rajesh";
      const uncle = "suresh";
      const child = "amit";

      // Existing: rajesh and suresh are siblings
      const existing = [
        makeRel({ personAId: parent, personBId: uncle, type: "sibling" }),
      ];

      const repo = mockRelationshipRepo(existing);
      const useCase = new InferRelationships(repo);

      // New: rajesh is parent of amit
      const newRel = makeRel({ personAId: parent, personBId: child, type: "parent-child" });

      const suggestions = await useCase.execute("fam-1", newRel);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0]).toMatchObject({
        personAId: uncle,
        personBId: child,
        type: "uncle-aunt",
      });
    });

    it("infers cousins when parent's sibling has children", async () => {
      const parent = "rajesh";
      const uncle = "suresh";
      const cousin = "neha";
      const child = "amit";

      // Existing: rajesh and suresh are siblings, suresh is parent of neha
      const existing = [
        makeRel({ personAId: parent, personBId: uncle, type: "sibling" }),
        makeRel({ personAId: uncle, personBId: cousin, type: "parent-child" }),
      ];

      const repo = mockRelationshipRepo(existing);
      const useCase = new InferRelationships(repo);

      // New: rajesh is parent of amit
      const newRel = makeRel({ personAId: parent, personBId: child, type: "parent-child" });

      const suggestions = await useCase.execute("fam-1", newRel);

      const cousinSuggestion = suggestions.find((s) => s.type === "cousin");
      expect(cousinSuggestion).toBeDefined();
      expect(cousinSuggestion).toMatchObject({
        personAId: child,
        personBId: cousin,
        type: "cousin",
      });
    });

    it("does not suggest already existing relationships", async () => {
      const grandma = "grandma";
      const parent = "rajesh";
      const child = "amit";

      // Existing: grandma->rajesh AND grandma->amit already exists
      const existing = [
        makeRel({ personAId: grandma, personBId: parent, type: "parent-child" }),
        makeRel({ personAId: grandma, personBId: child, type: "grandparent-grandchild" }),
      ];

      const repo = mockRelationshipRepo(existing);
      const useCase = new InferRelationships(repo);

      const newRel = makeRel({ personAId: parent, personBId: child, type: "parent-child" });

      const suggestions = await useCase.execute("fam-1", newRel);

      expect(suggestions).toHaveLength(0);
    });
  });

  describe("spouse inferences", () => {
    it("infers parent-in-law from spouse's parents", async () => {
      const grandma = "grandma";
      const rajesh = "rajesh";
      const priya = "priya";

      // Existing: grandma is parent of rajesh
      const existing = [
        makeRel({ personAId: grandma, personBId: rajesh, type: "parent-child" }),
      ];

      const repo = mockRelationshipRepo(existing);
      const useCase = new InferRelationships(repo);

      // New: rajesh is spouse of priya
      const newRel = makeRel({ personAId: rajesh, personBId: priya, type: "spouse" });

      const suggestions = await useCase.execute("fam-1", newRel);

      const inLawSuggestion = suggestions.find(
        (s) => s.type === "in-law" && s.personAId === grandma && s.personBId === priya,
      );
      expect(inLawSuggestion).toBeDefined();
      expect(inLawSuggestion).toMatchObject({
        aToBLabel: "Parent-in-law",
        bToALabel: "Child-in-law",
      });
    });

    it("infers sibling-in-law from spouse's siblings", async () => {
      const rajesh = "rajesh";
      const priya = "priya";
      const sunita = "sunita";

      // Existing: rajesh and sunita are siblings
      const existing = [
        makeRel({ personAId: rajesh, personBId: sunita, type: "sibling" }),
      ];

      const repo = mockRelationshipRepo(existing);
      const useCase = new InferRelationships(repo);

      // New: rajesh is spouse of priya
      const newRel = makeRel({ personAId: rajesh, personBId: priya, type: "spouse" });

      const suggestions = await useCase.execute("fam-1", newRel);

      const sibInLaw = suggestions.find(
        (s) => s.personAId === sunita && s.personBId === priya,
      );
      expect(sibInLaw).toBeDefined();
      expect(sibInLaw).toMatchObject({
        type: "in-law",
        aToBLabel: "Sibling-in-law",
      });
    });

    it("infers in-laws in both directions", async () => {
      const grandma = "grandma";
      const rajesh = "rajesh";
      const priyaMom = "priya-mom";
      const priya = "priya";

      // Existing: grandma is parent of rajesh, priya-mom is parent of priya
      const existing = [
        makeRel({ personAId: grandma, personBId: rajesh, type: "parent-child" }),
        makeRel({ personAId: priyaMom, personBId: priya, type: "parent-child" }),
      ];

      const repo = mockRelationshipRepo(existing);
      const useCase = new InferRelationships(repo);

      // New: rajesh is spouse of priya
      const newRel = makeRel({ personAId: rajesh, personBId: priya, type: "spouse" });

      const suggestions = await useCase.execute("fam-1", newRel);

      // grandma -> priya (parent-in-law)
      expect(suggestions.find((s) => s.personAId === grandma && s.personBId === priya)).toBeDefined();
      // priya-mom -> rajesh (parent-in-law)
      expect(suggestions.find((s) => s.personAId === priyaMom && s.personBId === rajesh)).toBeDefined();
    });
  });

  describe("no inferences", () => {
    it("returns empty for custom relationship types", async () => {
      const repo = mockRelationshipRepo([]);
      const useCase = new InferRelationships(repo);

      const newRel = makeRel({ personAId: "a", personBId: "b", type: "custom" });
      const suggestions = await useCase.execute("fam-1", newRel);

      expect(suggestions).toHaveLength(0);
    });

    it("returns empty when no related relationships exist", async () => {
      const repo = mockRelationshipRepo([]);
      const useCase = new InferRelationships(repo);

      const newRel = makeRel({ personAId: "a", personBId: "b", type: "parent-child" });
      const suggestions = await useCase.execute("fam-1", newRel);

      expect(suggestions).toHaveLength(0);
    });
  });
});
