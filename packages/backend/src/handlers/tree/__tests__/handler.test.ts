import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock repositories ---
vi.mock("../../../repositories/dynamodb/person-repo", () => ({
  DynamoPersonRepository: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("../../../repositories/dynamodb/relationship-repo", () => ({
  DynamoRelationshipRepository: vi.fn().mockImplementation(() => ({})),
}));

// --- Mock use cases ---
const { mockBuildFamilyTreeExecute, mockSerializeTree } = vi.hoisted(() => ({
  mockBuildFamilyTreeExecute: vi.fn(),
  mockSerializeTree: vi.fn(),
}));

vi.mock("../../../use-cases/tree", () => ({
  BuildFamilyTree: vi.fn().mockImplementation(() => ({
    execute: mockBuildFamilyTreeExecute,
  })),
  serializeTree: (...args: unknown[]) => mockSerializeTree(...args),
}));

vi.mock("../../../domain/errors", () => {
  class DomainError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
      this.statusCode = 400;
      this.name = "DomainError";
    }
  }
  return { DomainError };
});

import { DomainError } from "../../../domain/errors";
import { handler } from "../handler";

function createEvent(fieldName: string, args: Record<string, unknown> = {}) {
  return {
    info: { fieldName },
    arguments: args,
    identity: { sub: "test-sub" },
  } as unknown;
}

describe("tree handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- familyTree ---
  describe("familyTree", () => {
    it("builds and serializes family tree", async () => {
      const tree = { nodes: [], edges: [] };
      const serialized = { nodes: [], edges: [], json: true };
      mockBuildFamilyTreeExecute.mockResolvedValue(tree);
      mockSerializeTree.mockReturnValue(serialized);

      const result = await handler(createEvent("familyTree", { familyId: "f1" }) as any);

      expect(mockBuildFamilyTreeExecute).toHaveBeenCalledWith("f1");
      expect(mockSerializeTree).toHaveBeenCalledWith(tree);
      expect(result).toEqual(serialized);
    });
  });

  // --- unknown field ---
  it("throws on unknown fieldName", async () => {
    await expect(handler(createEvent("unknownField") as any)).rejects.toThrow(
      "Unknown field: unknownField",
    );
  });

  // --- DomainError ---
  it("wraps DomainError with code prefix", async () => {
    const domainErr = new (DomainError as any)("no data", "TREE_EMPTY");
    mockBuildFamilyTreeExecute.mockRejectedValue(domainErr);

    await expect(handler(createEvent("familyTree", { familyId: "f1" }) as any)).rejects.toThrow(
      "TREE_EMPTY: no data",
    );
  });

  it("re-throws non-DomainError errors as-is", async () => {
    mockBuildFamilyTreeExecute.mockRejectedValue(new Error("boom"));

    await expect(handler(createEvent("familyTree", { familyId: "f1" }) as any)).rejects.toThrow(
      "boom",
    );
  });
});
