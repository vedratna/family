import type { Person } from "@family-app/shared";
import { describe, it, expect, vi } from "vitest";

import type { IPersonRepository } from "../../../repositories/interfaces/person-repo";
import { PersonNameResolver } from "../enrichment";

function mockPersonRepo(persons: Person[] = []): IPersonRepository {
  return {
    create: vi.fn(),
    getById: vi.fn(),
    getByFamilyId: vi.fn().mockResolvedValue(persons),
    getByUserId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

const persons: Person[] = [
  {
    id: "person-1",
    familyId: "fam-1",
    name: "Mickey Mouse",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "person-2",
    familyId: "fam-1",
    name: "Minnie Mouse",
    createdAt: "2026-01-01T00:00:00Z",
  },
];

describe("PersonNameResolver", () => {
  it("resolves person name from family", async () => {
    const repo = mockPersonRepo(persons);
    const resolver = new PersonNameResolver(repo);
    expect(await resolver.getName("fam-1", "person-1")).toBe("Mickey Mouse");
  });

  it("returns 'System' for personId 'system' without DB call", async () => {
    const repo = mockPersonRepo(persons);
    const resolver = new PersonNameResolver(repo);
    expect(await resolver.getName("fam-1", "system")).toBe("System");
    expect(repo.getByFamilyId).not.toHaveBeenCalled();
  });

  it("returns 'Unknown' for missing person", async () => {
    const repo = mockPersonRepo(persons);
    const resolver = new PersonNameResolver(repo);
    expect(await resolver.getName("fam-1", "person-missing")).toBe("Unknown");
  });

  it("caches per-family lookups (single DB call for repeated names)", async () => {
    const repo = mockPersonRepo(persons);
    const resolver = new PersonNameResolver(repo);
    await resolver.getName("fam-1", "person-1");
    await resolver.getName("fam-1", "person-2");
    await resolver.getName("fam-1", "person-1");
    expect(repo.getByFamilyId).toHaveBeenCalledOnce();
  });

  it("caches separately per family", async () => {
    const repo = mockPersonRepo(persons);
    const resolver = new PersonNameResolver(repo);
    await resolver.getName("fam-1", "person-1");
    await resolver.getName("fam-2", "person-1");
    expect(repo.getByFamilyId).toHaveBeenCalledTimes(2);
  });
});
