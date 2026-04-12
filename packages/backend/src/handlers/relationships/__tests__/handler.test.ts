import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock repositories & use cases ---
const {
  mockGetByCognitoSub,
  mockGetByUserId,
  mockGetByFamilyAndPerson,
  mockGetRelationshipsForFamily,
  mockCreateRelationshipExecute,
  mockEditRelationshipExecute,
  mockDeleteRelationshipExecute,
  mockConfirmInferenceExecute,
  mockRejectInferenceExecute,
} = vi.hoisted(() => ({
  mockGetByCognitoSub: vi.fn(),
  mockGetByUserId: vi.fn(),
  mockGetByFamilyAndPerson: vi.fn(),
  mockGetRelationshipsForFamily: vi.fn(),
  mockCreateRelationshipExecute: vi.fn(),
  mockEditRelationshipExecute: vi.fn(),
  mockDeleteRelationshipExecute: vi.fn(),
  mockConfirmInferenceExecute: vi.fn(),
  mockRejectInferenceExecute: vi.fn(),
}));

vi.mock("../../../repositories/dynamodb/user-repo", () => ({
  DynamoUserRepository: vi.fn().mockImplementation(() => ({
    getByCognitoSub: mockGetByCognitoSub,
  })),
}));

vi.mock("../../../repositories/dynamodb/person-repo", () => ({
  DynamoPersonRepository: vi.fn().mockImplementation(() => ({
    getByUserId: mockGetByUserId,
  })),
}));

vi.mock("../../../repositories/dynamodb/membership-repo", () => ({
  DynamoMembershipRepository: vi.fn().mockImplementation(() => ({
    getByFamilyAndPerson: mockGetByFamilyAndPerson,
  })),
}));

vi.mock("../../../repositories/dynamodb/relationship-repo", () => ({
  DynamoRelationshipRepository: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("../../../use-cases/relationships", () => ({
  GetRelationships: vi.fn().mockImplementation(() => ({
    forFamily: mockGetRelationshipsForFamily,
  })),
  CreateRelationship: vi.fn().mockImplementation(() => ({
    execute: mockCreateRelationshipExecute,
  })),
  EditRelationship: vi.fn().mockImplementation(() => ({
    execute: mockEditRelationshipExecute,
  })),
  DeleteRelationship: vi.fn().mockImplementation(() => ({
    execute: mockDeleteRelationshipExecute,
  })),
  ConfirmInference: vi.fn().mockImplementation(() => ({
    execute: mockConfirmInferenceExecute,
  })),
  RejectInference: vi.fn().mockImplementation(() => ({
    execute: mockRejectInferenceExecute,
  })),
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

function createEvent(fieldName: string, args: Record<string, unknown> = {}, sub = "test-sub") {
  return {
    info: { fieldName },
    arguments: args,
    identity: { sub },
  } as unknown;
}

function mockResolveRequesterRole(role = "admin" as const) {
  mockGetByCognitoSub.mockResolvedValue({ id: "u1" });
  mockGetByUserId.mockResolvedValue({ id: "p1" });
  mockGetByFamilyAndPerson.mockResolvedValue({ role });
}

describe("relationships handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- familyRelationships ---
  describe("familyRelationships", () => {
    it("returns relationships for familyId", async () => {
      const rels = [{ personAId: "p1", personBId: "p2" }];
      mockGetRelationshipsForFamily.mockResolvedValue(rels);

      const result = await handler(createEvent("familyRelationships", { familyId: "f1" }) as any);

      expect(mockGetRelationshipsForFamily).toHaveBeenCalledWith("f1");
      expect(result).toEqual(rels);
    });
  });

  // --- createRelationship ---
  describe("createRelationship", () => {
    it("creates relationship with requester role", async () => {
      mockResolveRequesterRole("admin" as any);
      const rel = { id: "rel-1" };
      mockCreateRelationshipExecute.mockResolvedValue(rel);

      const result = await handler(
        createEvent("createRelationship", {
          familyId: "f1",
          personAId: "pA",
          personBId: "pB",
          aToBLabel: "parent",
          bToALabel: "child",
          type: "parent_child",
        }) as any,
      );

      expect(mockCreateRelationshipExecute).toHaveBeenCalledWith({
        familyId: "f1",
        personAId: "pA",
        personBId: "pB",
        aToBLabel: "parent",
        bToALabel: "child",
        type: "parent_child",
        requesterRole: "admin",
      });
      expect(result).toEqual(rel);
    });
  });

  // --- editRelationship ---
  describe("editRelationship", () => {
    it("edits relationship with required fields and returns true", async () => {
      mockResolveRequesterRole("admin" as any);
      mockEditRelationshipExecute.mockResolvedValue(undefined);

      const result = await handler(
        createEvent("editRelationship", {
          familyId: "f1",
          personAId: "pA",
          personBId: "pB",
        }) as any,
      );

      expect(mockEditRelationshipExecute).toHaveBeenCalledWith({
        familyId: "f1",
        personAId: "pA",
        personBId: "pB",
        requesterRole: "admin",
      });
      expect(result).toBe(true);
    });

    it("passes optional labels and type when provided as strings", async () => {
      mockResolveRequesterRole("admin" as any);
      mockEditRelationshipExecute.mockResolvedValue(undefined);

      await handler(
        createEvent("editRelationship", {
          familyId: "f1",
          personAId: "pA",
          personBId: "pB",
          aToBLabel: "sibling",
          bToALabel: "sibling",
          type: "sibling",
        }) as any,
      );

      expect(mockEditRelationshipExecute).toHaveBeenCalledWith({
        familyId: "f1",
        personAId: "pA",
        personBId: "pB",
        requesterRole: "admin",
        aToBLabel: "sibling",
        bToALabel: "sibling",
        type: "sibling",
      });
    });

    it("does not pass optional fields when wrong types", async () => {
      mockResolveRequesterRole("admin" as any);
      mockEditRelationshipExecute.mockResolvedValue(undefined);

      await handler(
        createEvent("editRelationship", {
          familyId: "f1",
          personAId: "pA",
          personBId: "pB",
          aToBLabel: 123,
          bToALabel: null,
          type: false,
        }) as any,
      );

      expect(mockEditRelationshipExecute).toHaveBeenCalledWith({
        familyId: "f1",
        personAId: "pA",
        personBId: "pB",
        requesterRole: "admin",
      });
    });
  });

  // --- deleteRelationship ---
  describe("deleteRelationship", () => {
    it("deletes relationship and returns true", async () => {
      mockResolveRequesterRole("admin" as any);
      mockDeleteRelationshipExecute.mockResolvedValue(undefined);

      const result = await handler(
        createEvent("deleteRelationship", {
          familyId: "f1",
          personAId: "pA",
          personBId: "pB",
        }) as any,
      );

      expect(mockDeleteRelationshipExecute).toHaveBeenCalledWith("f1", "pA", "pB", "admin");
      expect(result).toBe(true);
    });
  });

  // --- confirmInference ---
  describe("confirmInference", () => {
    it("confirms inference and returns true", async () => {
      mockResolveRequesterRole("admin" as any);
      mockConfirmInferenceExecute.mockResolvedValue(undefined);

      const result = await handler(
        createEvent("confirmInference", {
          familyId: "f1",
          personAId: "pA",
          personBId: "pB",
        }) as any,
      );

      expect(mockConfirmInferenceExecute).toHaveBeenCalledWith("f1", "pA", "pB", "admin");
      expect(result).toBe(true);
    });
  });

  // --- rejectInference ---
  describe("rejectInference", () => {
    it("rejects inference and returns true", async () => {
      mockResolveRequesterRole("admin" as any);
      mockRejectInferenceExecute.mockResolvedValue(undefined);

      const result = await handler(
        createEvent("rejectInference", {
          familyId: "f1",
          personAId: "pA",
          personBId: "pB",
        }) as any,
      );

      expect(mockRejectInferenceExecute).toHaveBeenCalledWith("f1", "pA", "pB", "admin");
      expect(result).toBe(true);
    });
  });

  // --- resolveRequesterRole error paths ---
  describe("resolveRequesterRole", () => {
    it("throws when user not found", async () => {
      mockGetByCognitoSub.mockResolvedValue(undefined);

      await expect(
        handler(createEvent("createRelationship", { familyId: "f1" }) as any),
      ).rejects.toThrow("USER_NOT_FOUND");
    });

    it("throws when person not found", async () => {
      mockGetByCognitoSub.mockResolvedValue({ id: "u1" });
      mockGetByUserId.mockResolvedValue(undefined);

      await expect(
        handler(createEvent("createRelationship", { familyId: "f1" }) as any),
      ).rejects.toThrow("MEMBER_NOT_FOUND: Caller is not a member");
    });

    it("throws when membership not found", async () => {
      mockGetByCognitoSub.mockResolvedValue({ id: "u1" });
      mockGetByUserId.mockResolvedValue({ id: "p1" });
      mockGetByFamilyAndPerson.mockResolvedValue(undefined);

      await expect(
        handler(createEvent("createRelationship", { familyId: "f1" }) as any),
      ).rejects.toThrow("MEMBER_NOT_FOUND: No membership found");
    });

    it("uses empty string when identity is undefined", async () => {
      mockGetByCognitoSub.mockResolvedValue(undefined);

      const event = {
        info: { fieldName: "createRelationship" },
        arguments: { familyId: "f1" },
        identity: undefined,
      } as unknown;

      await expect(handler(event as any)).rejects.toThrow("USER_NOT_FOUND");
      expect(mockGetByCognitoSub).toHaveBeenCalledWith("");
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
    mockResolveRequesterRole();
    const domainErr = new (DomainError as any)("already exists", "REL_DUPLICATE");
    mockCreateRelationshipExecute.mockRejectedValue(domainErr);

    await expect(
      handler(
        createEvent("createRelationship", {
          familyId: "f1",
          personAId: "pA",
          personBId: "pB",
          aToBLabel: "x",
          bToALabel: "y",
          type: "t",
        }) as any,
      ),
    ).rejects.toThrow("REL_DUPLICATE: already exists");
  });

  it("re-throws non-DomainError errors as-is", async () => {
    mockResolveRequesterRole();
    mockCreateRelationshipExecute.mockRejectedValue(new Error("boom"));

    await expect(
      handler(
        createEvent("createRelationship", {
          familyId: "f1",
          personAId: "pA",
          personBId: "pB",
          aToBLabel: "x",
          bToALabel: "y",
          type: "t",
        }) as any,
      ),
    ).rejects.toThrow("boom");
  });
});
