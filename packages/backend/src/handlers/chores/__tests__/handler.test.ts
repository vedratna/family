import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock repositories & use cases ---
const {
  mockGetByCognitoSub,
  mockGetByUserId,
  mockGetByFamilyAndPerson,
  mockGetFamilyChoresExecute,
  mockCreateChoreExecute,
  mockCompleteChoreExecute,
  mockRotateChoreExecute,
} = vi.hoisted(() => ({
  mockGetByCognitoSub: vi.fn(),
  mockGetByUserId: vi.fn(),
  mockGetByFamilyAndPerson: vi.fn(),
  mockGetFamilyChoresExecute: vi.fn(),
  mockCreateChoreExecute: vi.fn(),
  mockCompleteChoreExecute: vi.fn(),
  mockRotateChoreExecute: vi.fn(),
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

vi.mock("../../../repositories/dynamodb/chore-repo", () => ({
  DynamoChoreRepository: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("../../../use-cases/chores", () => ({
  GetFamilyChores: vi.fn().mockImplementation(() => ({
    execute: mockGetFamilyChoresExecute,
  })),
  CreateChore: vi.fn().mockImplementation(() => ({
    execute: mockCreateChoreExecute,
  })),
  CompleteChore: vi.fn().mockImplementation(() => ({
    execute: mockCompleteChoreExecute,
  })),
  RotateChore: vi.fn().mockImplementation(() => ({
    execute: mockRotateChoreExecute,
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

describe("chores handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- familyChores ---
  describe("familyChores", () => {
    it("returns chores with only familyId", async () => {
      const chores = [{ id: "c1" }];
      mockGetFamilyChoresExecute.mockResolvedValue(chores);

      const result = await handler(createEvent("familyChores", { familyId: "f1" }) as any);

      expect(mockGetFamilyChoresExecute).toHaveBeenCalledWith({ familyId: "f1" });
      expect(result).toEqual(chores);
    });

    it("passes assigneePersonId and status when provided", async () => {
      mockGetFamilyChoresExecute.mockResolvedValue([]);

      await handler(
        createEvent("familyChores", {
          familyId: "f1",
          assigneePersonId: "p1",
          status: "pending",
        }) as any,
      );

      expect(mockGetFamilyChoresExecute).toHaveBeenCalledWith({
        familyId: "f1",
        assigneePersonId: "p1",
        status: "pending",
      });
    });

    it("does not pass optional fields when wrong types", async () => {
      mockGetFamilyChoresExecute.mockResolvedValue([]);

      await handler(
        createEvent("familyChores", {
          familyId: "f1",
          assigneePersonId: 123,
          status: true,
        }) as any,
      );

      expect(mockGetFamilyChoresExecute).toHaveBeenCalledWith({ familyId: "f1" });
    });
  });

  // --- createChore ---
  describe("createChore", () => {
    it("creates chore with required fields", async () => {
      mockResolveRequesterRole("admin" as any);
      const chore = { id: "c1" };
      mockCreateChoreExecute.mockResolvedValue(chore);

      const result = await handler(
        createEvent("createChore", {
          familyId: "f1",
          title: "Dishes",
          assigneePersonId: "p2",
        }) as any,
      );

      expect(mockCreateChoreExecute).toHaveBeenCalledWith({
        familyId: "f1",
        title: "Dishes",
        assigneePersonId: "p2",
        requesterRole: "admin",
      });
      expect(result).toEqual(chore);
    });

    it("passes optional fields when provided", async () => {
      mockResolveRequesterRole("admin" as any);
      mockCreateChoreExecute.mockResolvedValue({ id: "c1" });

      await handler(
        createEvent("createChore", {
          familyId: "f1",
          title: "Dishes",
          assigneePersonId: "p2",
          description: "Do the dishes",
          dueDate: "2024-01-15",
          recurrenceRule: "FREQ=DAILY",
          rotationMembers: ["p2", "p3"],
        }) as any,
      );

      expect(mockCreateChoreExecute).toHaveBeenCalledWith({
        familyId: "f1",
        title: "Dishes",
        assigneePersonId: "p2",
        requesterRole: "admin",
        description: "Do the dishes",
        dueDate: "2024-01-15",
        recurrenceRule: "FREQ=DAILY",
        rotationMembers: ["p2", "p3"],
      });
    });

    it("does not pass optional fields when wrong types", async () => {
      mockResolveRequesterRole("admin" as any);
      mockCreateChoreExecute.mockResolvedValue({ id: "c1" });

      await handler(
        createEvent("createChore", {
          familyId: "f1",
          title: "Dishes",
          assigneePersonId: "p2",
          description: 123,
          dueDate: true,
          recurrenceRule: null,
          rotationMembers: "not-array",
        }) as any,
      );

      expect(mockCreateChoreExecute).toHaveBeenCalledWith({
        familyId: "f1",
        title: "Dishes",
        assigneePersonId: "p2",
        requesterRole: "admin",
      });
    });
  });

  // --- completeChore ---
  describe("completeChore", () => {
    it("completes chore and returns true", async () => {
      mockCompleteChoreExecute.mockResolvedValue(undefined);

      const result = await handler(
        createEvent("completeChore", { familyId: "f1", choreId: "c1" }) as any,
      );

      expect(mockCompleteChoreExecute).toHaveBeenCalledWith("f1", "c1");
      expect(result).toBe(true);
    });
  });

  // --- rotateChore ---
  describe("rotateChore", () => {
    it("rotates chore and returns result", async () => {
      const rotated = { nextAssignee: "p3" };
      mockRotateChoreExecute.mockResolvedValue(rotated);

      const result = await handler(
        createEvent("rotateChore", { familyId: "f1", choreId: "c1" }) as any,
      );

      expect(mockRotateChoreExecute).toHaveBeenCalledWith("f1", "c1");
      expect(result).toEqual(rotated);
    });
  });

  // --- resolveRequesterRole error paths ---
  describe("resolveRequesterRole", () => {
    it("throws when user not found", async () => {
      mockGetByCognitoSub.mockResolvedValue(undefined);

      await expect(
        handler(
          createEvent("createChore", { familyId: "f1", title: "X", assigneePersonId: "p2" }) as any,
        ),
      ).rejects.toThrow("USER_NOT_FOUND");
    });

    it("throws when person not found", async () => {
      mockGetByCognitoSub.mockResolvedValue({ id: "u1" });
      mockGetByUserId.mockResolvedValue(undefined);

      await expect(
        handler(
          createEvent("createChore", { familyId: "f1", title: "X", assigneePersonId: "p2" }) as any,
        ),
      ).rejects.toThrow("MEMBER_NOT_FOUND: Caller is not a member");
    });

    it("throws when membership not found", async () => {
      mockGetByCognitoSub.mockResolvedValue({ id: "u1" });
      mockGetByUserId.mockResolvedValue({ id: "p1" });
      mockGetByFamilyAndPerson.mockResolvedValue(undefined);

      await expect(
        handler(
          createEvent("createChore", { familyId: "f1", title: "X", assigneePersonId: "p2" }) as any,
        ),
      ).rejects.toThrow("MEMBER_NOT_FOUND: No membership found");
    });

    it("uses empty string when identity is undefined", async () => {
      mockGetByCognitoSub.mockResolvedValue(undefined);

      const event = {
        info: { fieldName: "createChore" },
        arguments: { familyId: "f1", title: "X", assigneePersonId: "p2" },
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
    const domainErr = new (DomainError as any)("chore exists", "CHORE_DUPLICATE");
    mockCreateChoreExecute.mockRejectedValue(domainErr);

    await expect(
      handler(
        createEvent("createChore", { familyId: "f1", title: "X", assigneePersonId: "p2" }) as any,
      ),
    ).rejects.toThrow("CHORE_DUPLICATE: chore exists");
  });

  it("re-throws non-DomainError errors as-is", async () => {
    mockResolveRequesterRole();
    mockCreateChoreExecute.mockRejectedValue(new Error("boom"));

    await expect(
      handler(
        createEvent("createChore", { familyId: "f1", title: "X", assigneePersonId: "p2" }) as any,
      ),
    ).rejects.toThrow("boom");
  });
});
