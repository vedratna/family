import type { Person, Relationship } from "@family-app/shared";
import { describe, it, expect } from "vitest";

import { buildTreeFromData } from "../build-family-tree";

function makePerson(id: string, name: string, userId?: string): Person {
  const person: Person = { id, familyId: "fam-1", name, createdAt: "2026-01-01T00:00:00Z" };
  if (userId !== undefined) {
    person.userId = userId;
  }
  return person;
}

function makeRel(personAId: string, personBId: string, type: Relationship["type"]): Relationship {
  return {
    id: crypto.randomUUID(),
    familyId: "fam-1",
    personAId,
    personBId,
    aToBLabel: "A",
    bToALabel: "B",
    type,
    status: "confirmed",
    createdAt: "2026-01-01T00:00:00Z",
  };
}

describe("buildTreeFromData", () => {
  it("builds tree with single parent-child", () => {
    const persons = [makePerson("grandma", "Grandma"), makePerson("rajesh", "Rajesh")];
    const rels = [makeRel("grandma", "rajesh", "parent-child")];

    const tree = buildTreeFromData(persons, rels);

    expect(tree.rootIds).toEqual(["grandma"]);
    expect(tree.generations).toBe(2);

    const grandmaNode = tree.nodes.get("grandma");
    expect(grandmaNode?.generation).toBe(0);
    expect(grandmaNode?.childIds).toEqual(["rajesh"]);

    const rajeshNode = tree.nodes.get("rajesh");
    expect(rajeshNode?.generation).toBe(1);
    expect(rajeshNode?.parentIds).toEqual(["grandma"]);
  });

  it("builds three-generation tree", () => {
    const persons = [
      makePerson("grandma", "Grandma"),
      makePerson("rajesh", "Rajesh"),
      makePerson("amit", "Amit"),
    ];
    const rels = [
      makeRel("grandma", "rajesh", "parent-child"),
      makeRel("rajesh", "amit", "parent-child"),
    ];

    const tree = buildTreeFromData(persons, rels);

    expect(tree.generations).toBe(3);
    expect(tree.nodes.get("grandma")?.generation).toBe(0);
    expect(tree.nodes.get("rajesh")?.generation).toBe(1);
    expect(tree.nodes.get("amit")?.generation).toBe(2);
  });

  it("places spouses at the same generation", () => {
    const persons = [
      makePerson("rajesh", "Rajesh"),
      makePerson("priya", "Priya"),
      makePerson("amit", "Amit"),
    ];
    const rels = [makeRel("rajesh", "priya", "spouse"), makeRel("rajesh", "amit", "parent-child")];

    const tree = buildTreeFromData(persons, rels);

    expect(tree.nodes.get("rajesh")?.generation).toBe(0);
    expect(tree.nodes.get("priya")?.generation).toBe(0);
    expect(tree.nodes.get("amit")?.generation).toBe(1);
  });

  it("supports multiple root nodes (two lineages)", () => {
    const persons = [
      makePerson("paternal-gp", "Paternal Grandpa"),
      makePerson("maternal-gp", "Maternal Grandpa"),
      makePerson("father", "Father"),
      makePerson("mother", "Mother"),
      makePerson("child", "Child"),
    ];
    const rels = [
      makeRel("paternal-gp", "father", "parent-child"),
      makeRel("maternal-gp", "mother", "parent-child"),
      makeRel("father", "mother", "spouse"),
      makeRel("father", "child", "parent-child"),
    ];

    const tree = buildTreeFromData(persons, rels);

    // Both grandparents are roots
    expect(tree.rootIds).toContain("paternal-gp");
    expect(tree.rootIds).toContain("maternal-gp");

    // Same generation for grandparents
    expect(tree.nodes.get("paternal-gp")?.generation).toBe(0);
    expect(tree.nodes.get("maternal-gp")?.generation).toBe(0);

    // Parents at gen 1, child at gen 2
    expect(tree.nodes.get("father")?.generation).toBe(1);
    expect(tree.nodes.get("mother")?.generation).toBe(1);
    expect(tree.nodes.get("child")?.generation).toBe(2);
  });

  it("handles person with no relationships (isolated node)", () => {
    const persons = [makePerson("rajesh", "Rajesh"), makePerson("isolated", "Isolated Person")];
    const rels: Relationship[] = [];

    const tree = buildTreeFromData(persons, rels);

    // Both are roots since neither has parents
    expect(tree.rootIds).toContain("rajesh");
    expect(tree.rootIds).toContain("isolated");
    expect(tree.nodes.get("isolated")?.generation).toBe(0);
  });

  it("handles complex family with siblings and spouses", () => {
    const persons = [
      makePerson("grandma", "Grandma"),
      makePerson("rajesh", "Rajesh"),
      makePerson("sunita", "Sunita"),
      makePerson("priya", "Priya"),
      makePerson("vinod", "Vinod"),
      makePerson("amit", "Amit"),
      makePerson("neha", "Neha"),
    ];
    const rels = [
      makeRel("grandma", "rajesh", "parent-child"),
      makeRel("grandma", "sunita", "parent-child"),
      makeRel("rajesh", "priya", "spouse"),
      makeRel("sunita", "vinod", "spouse"),
      makeRel("rajesh", "amit", "parent-child"),
      makeRel("sunita", "neha", "parent-child"),
    ];

    const tree = buildTreeFromData(persons, rels);

    expect(tree.nodes.get("grandma")?.generation).toBe(0);
    expect(tree.nodes.get("rajesh")?.generation).toBe(1);
    expect(tree.nodes.get("sunita")?.generation).toBe(1);
    expect(tree.nodes.get("priya")?.generation).toBe(1); // spouse
    expect(tree.nodes.get("vinod")?.generation).toBe(1); // spouse
    expect(tree.nodes.get("amit")?.generation).toBe(2);
    expect(tree.nodes.get("neha")?.generation).toBe(2);

    expect(tree.rootIds).toEqual(["grandma"]);
    expect(tree.generations).toBe(3);
  });

  it("ignores pending relationships", () => {
    const persons = [makePerson("a", "A"), makePerson("b", "B")];
    const rels: Relationship[] = [
      {
        id: "r1",
        familyId: "fam-1",
        personAId: "a",
        personBId: "b",
        aToBLabel: "X",
        bToALabel: "Y",
        type: "parent-child",
        status: "pending",
        createdAt: "2026-01-01T00:00:00Z",
      },
    ];

    const tree = buildTreeFromData(persons, rels);

    // No connections — both are roots
    expect(tree.rootIds).toContain("a");
    expect(tree.rootIds).toContain("b");
    expect(tree.nodes.get("a")?.childIds).toEqual([]);
  });
});
