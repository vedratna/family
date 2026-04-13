import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock repositories & use cases ---
const {
  mockGetByCognitoSub,
  mockGetByUserId,
  mockGetByFamilyAndPerson,
  mockGetByFamilyId_membership,
  mockGetByFamilyId_person,
  mockGetUserFamiliesExecute,
  mockCreateFamilyExecute,
  mockInviteMemberExecute,
  mockAcceptInvitationExecute,
  mockAddNonAppPersonExecute,
  mockUpdateMemberRoleExecute,
  mockTransferOwnershipExecute,
  mockRemoveMemberExecute,
  mockUpdateFamilyThemeExecute,
} = vi.hoisted(() => ({
  mockGetByCognitoSub: vi.fn(),
  mockGetByUserId: vi.fn(),
  mockGetByFamilyAndPerson: vi.fn(),
  mockGetByFamilyId_membership: vi.fn(),
  mockGetByFamilyId_person: vi.fn(),
  mockGetUserFamiliesExecute: vi.fn(),
  mockCreateFamilyExecute: vi.fn(),
  mockInviteMemberExecute: vi.fn(),
  mockAcceptInvitationExecute: vi.fn(),
  mockAddNonAppPersonExecute: vi.fn(),
  mockUpdateMemberRoleExecute: vi.fn(),
  mockTransferOwnershipExecute: vi.fn(),
  mockRemoveMemberExecute: vi.fn(),
  mockUpdateFamilyThemeExecute: vi.fn(),
}));

vi.mock("../../../repositories/dynamodb/user-repo", () => ({
  DynamoUserRepository: vi.fn().mockImplementation(() => ({
    getByCognitoSub: mockGetByCognitoSub,
  })),
}));

vi.mock("../../../repositories/dynamodb/family-repo", () => ({
  DynamoFamilyRepository: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("../../../repositories/dynamodb/person-repo", () => ({
  DynamoPersonRepository: vi.fn().mockImplementation(() => ({
    getByUserId: mockGetByUserId,
    getByFamilyId: mockGetByFamilyId_person,
  })),
}));

vi.mock("../../../repositories/dynamodb/membership-repo", () => ({
  DynamoMembershipRepository: vi.fn().mockImplementation(() => ({
    getByFamilyAndPerson: mockGetByFamilyAndPerson,
    getByFamilyId: mockGetByFamilyId_membership,
  })),
}));

vi.mock("../../../repositories/dynamodb/invitation-repo", () => ({
  DynamoInvitationRepository: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("../../../repositories/dynamodb/s3-storage-service", () => ({
  S3StorageService: vi.fn().mockImplementation(() => ({
    generateDownloadUrl: vi.fn().mockResolvedValue(null),
  })),
}));

vi.mock("../../../use-cases/family", () => ({
  GetUserFamilies: vi.fn().mockImplementation(() => ({
    execute: mockGetUserFamiliesExecute,
  })),
  CreateFamily: vi.fn().mockImplementation(() => ({
    execute: mockCreateFamilyExecute,
  })),
  InviteMember: vi.fn().mockImplementation(() => ({
    execute: mockInviteMemberExecute,
  })),
  AcceptInvitation: vi.fn().mockImplementation(() => ({
    execute: mockAcceptInvitationExecute,
  })),
  AddNonAppPerson: vi.fn().mockImplementation(() => ({
    execute: mockAddNonAppPersonExecute,
  })),
  UpdateMemberRole: vi.fn().mockImplementation(() => ({
    execute: mockUpdateMemberRoleExecute,
  })),
  TransferOwnership: vi.fn().mockImplementation(() => ({
    execute: mockTransferOwnershipExecute,
  })),
  RemoveMember: vi.fn().mockImplementation(() => ({
    execute: mockRemoveMemberExecute,
  })),
  UpdateFamilyTheme: vi.fn().mockImplementation(() => ({
    execute: mockUpdateFamilyThemeExecute,
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

function createEvent(
  fieldName: string,
  args: Record<string, unknown> = {},
  sub = "test-cognito-sub",
) {
  return {
    info: { fieldName },
    arguments: args,
    identity: { sub },
  } as unknown;
}

/** Helper: set up mocks so resolveUserId succeeds */
function mockResolveUserId(userId = "user-123") {
  mockGetByCognitoSub.mockResolvedValue({ id: userId });
}

/** Helper: set up mocks so resolveRequesterRole succeeds */
function mockResolveRequesterRole(
  personId = "person-1",
  role = "admin" as const,
  userId = "user-123",
) {
  mockGetByCognitoSub.mockResolvedValue({ id: userId });
  mockGetByUserId.mockResolvedValue({ id: personId });
  mockGetByFamilyAndPerson.mockResolvedValue({ role });
}

describe("family handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- myFamilies ---
  describe("myFamilies", () => {
    it("resolves userId and returns families with personId", async () => {
      mockResolveUserId("u1");
      const families = [
        {
          family: { id: "f1", name: "Smith" },
          membership: { personId: "p1", role: "admin", familyId: "f1" },
        },
      ];
      mockGetUserFamiliesExecute.mockResolvedValue(families);

      const result = await handler(createEvent("myFamilies") as any);

      expect(mockGetUserFamiliesExecute).toHaveBeenCalledWith("u1");
      expect(result).toEqual([
        { family: { id: "f1", name: "Smith" }, role: "admin", personId: "p1" },
      ]);
    });

    it("throws when user not found", async () => {
      mockGetByCognitoSub.mockResolvedValue(undefined);
      await expect(handler(createEvent("myFamilies") as any)).rejects.toThrow("USER_NOT_FOUND");
    });
  });

  // --- familyMembers ---
  describe("familyMembers", () => {
    it("returns memberships and persons for familyId", async () => {
      const memberships = [{ personId: "p1", role: "admin" }];
      const persons = [{ id: "p1", name: "Alice" }];
      mockGetByFamilyId_membership.mockResolvedValue(memberships);
      mockGetByFamilyId_person.mockResolvedValue(persons);

      const result = await handler(createEvent("familyMembers", { familyId: "f1" }) as any);

      expect(mockGetByFamilyId_membership).toHaveBeenCalledWith("f1");
      expect(mockGetByFamilyId_person).toHaveBeenCalledWith("f1");
      expect(result).toEqual({
        memberships,
        persons: [{ id: "p1", name: "Alice", profilePhotoUrl: null }],
      });
    });
  });

  // --- createFamily ---
  describe("createFamily", () => {
    it("creates a family with resolved userId", async () => {
      mockResolveUserId("u1");
      const created = { id: "f1", name: "Smith" };
      mockCreateFamilyExecute.mockResolvedValue(created);

      const result = await handler(
        createEvent("createFamily", {
          name: "Smith",
          themeName: "classic",
          displayName: "Alice",
        }) as any,
      );

      expect(mockCreateFamilyExecute).toHaveBeenCalledWith({
        name: "Smith",
        themeName: "classic",
        userId: "u1",
        displayName: "Alice",
      });
      expect(result).toEqual(created);
    });
  });

  // --- inviteMember ---
  describe("inviteMember", () => {
    it("invites a member with requester role", async () => {
      mockResolveRequesterRole("person-1", "admin" as any);
      const invitation = { id: "inv-1" };
      mockInviteMemberExecute.mockResolvedValue(invitation);

      const result = await handler(
        createEvent("inviteMember", {
          familyId: "f1",
          phone: "+1234",
          name: "Bob",
          relationshipToInviter: "sibling",
          inverseRelationshipLabel: "sibling",
          role: "member",
        }) as any,
      );

      expect(mockInviteMemberExecute).toHaveBeenCalledWith({
        familyId: "f1",
        inviterPersonId: "person-1",
        inviterRole: "admin",
        phone: "+1234",
        name: "Bob",
        relationshipToInviter: "sibling",
        inverseRelationshipLabel: "sibling",
        role: "member",
      });
      expect(result).toEqual(invitation);
    });

    it("throws when person not found for resolveRequesterRole", async () => {
      mockGetByCognitoSub.mockResolvedValue({ id: "u1" });
      mockGetByUserId.mockResolvedValue(undefined);

      await expect(handler(createEvent("inviteMember", { familyId: "f1" }) as any)).rejects.toThrow(
        "MEMBER_NOT_FOUND: Caller is not a member",
      );
    });

    it("throws when membership not found for resolveRequesterRole", async () => {
      mockGetByCognitoSub.mockResolvedValue({ id: "u1" });
      mockGetByUserId.mockResolvedValue({ id: "p1" });
      mockGetByFamilyAndPerson.mockResolvedValue(undefined);

      await expect(handler(createEvent("inviteMember", { familyId: "f1" }) as any)).rejects.toThrow(
        "MEMBER_NOT_FOUND: No membership found",
      );
    });
  });

  // --- acceptInvitation ---
  describe("acceptInvitation", () => {
    it("accepts invitation", async () => {
      mockResolveUserId("u1");
      const result = { personId: "p1" };
      mockAcceptInvitationExecute.mockResolvedValue(result);

      const res = await handler(
        createEvent("acceptInvitation", {
          familyId: "f1",
          phone: "+1234",
          displayName: "Bob",
        }) as any,
      );

      expect(mockAcceptInvitationExecute).toHaveBeenCalledWith({
        familyId: "f1",
        phone: "+1234",
        userId: "u1",
        displayName: "Bob",
      });
      expect(res).toEqual(result);
    });
  });

  // --- addNonAppPerson ---
  describe("addNonAppPerson", () => {
    it("adds a non-app person with requester role", async () => {
      mockResolveRequesterRole("p1", "admin" as any);
      const person = { id: "p2", name: "Charlie" };
      mockAddNonAppPersonExecute.mockResolvedValue(person);

      const result = await handler(
        createEvent("addNonAppPerson", { familyId: "f1", name: "Charlie" }) as any,
      );

      expect(mockAddNonAppPersonExecute).toHaveBeenCalledWith({
        familyId: "f1",
        name: "Charlie",
        requesterRole: "admin",
      });
      expect(result).toEqual(person);
    });
  });

  // --- updateMemberRole ---
  describe("updateMemberRole", () => {
    it("updates member role and returns true", async () => {
      mockResolveRequesterRole("p1", "admin" as any);
      mockUpdateMemberRoleExecute.mockResolvedValue(undefined);

      const result = await handler(
        createEvent("updateMemberRole", {
          familyId: "f1",
          targetPersonId: "p2",
          newRole: "member",
        }) as any,
      );

      expect(mockUpdateMemberRoleExecute).toHaveBeenCalledWith({
        familyId: "f1",
        targetPersonId: "p2",
        newRole: "member",
        requesterRole: "admin",
      });
      expect(result).toBe(true);
    });
  });

  // --- transferOwnership ---
  describe("transferOwnership", () => {
    it("transfers ownership and returns true", async () => {
      mockResolveRequesterRole("p1", "owner" as any);
      mockTransferOwnershipExecute.mockResolvedValue(undefined);

      const result = await handler(
        createEvent("transferOwnership", {
          familyId: "f1",
          newOwnerPersonId: "p2",
        }) as any,
      );

      expect(mockTransferOwnershipExecute).toHaveBeenCalledWith({
        familyId: "f1",
        currentOwnerPersonId: "p1",
        newOwnerPersonId: "p2",
        requesterRole: "owner",
      });
      expect(result).toBe(true);
    });
  });

  // --- removeMember ---
  describe("removeMember", () => {
    it("removes member and returns true", async () => {
      mockResolveRequesterRole("p1", "admin" as any);
      mockRemoveMemberExecute.mockResolvedValue(undefined);

      const result = await handler(
        createEvent("removeMember", {
          familyId: "f1",
          targetPersonId: "p2",
        }) as any,
      );

      expect(mockRemoveMemberExecute).toHaveBeenCalledWith({
        familyId: "f1",
        targetPersonId: "p2",
        requesterRole: "admin",
      });
      expect(result).toBe(true);
    });
  });

  // --- updateFamilyTheme ---
  describe("updateFamilyTheme", () => {
    it("updates theme and returns true", async () => {
      mockResolveRequesterRole("p1", "admin" as any);
      mockUpdateFamilyThemeExecute.mockResolvedValue(undefined);

      const result = await handler(
        createEvent("updateFamilyTheme", {
          familyId: "f1",
          themeName: "modern",
        }) as any,
      );

      expect(mockUpdateFamilyThemeExecute).toHaveBeenCalledWith({
        familyId: "f1",
        themeName: "modern",
        requesterRole: "admin",
      });
      expect(result).toBe(true);
    });
  });

  // --- unknown field ---
  it("throws on unknown fieldName", async () => {
    await expect(handler(createEvent("unknownField") as any)).rejects.toThrow(
      "Unknown field: unknownField",
    );
  });

  // --- DomainError re-throw ---
  it("wraps DomainError with code prefix", async () => {
    mockResolveUserId("u1");
    const domainErr = new (DomainError as any)("name taken", "FAMILY_DUPLICATE");
    mockCreateFamilyExecute.mockRejectedValue(domainErr);

    await expect(
      handler(createEvent("createFamily", { name: "X", themeName: "t", displayName: "D" }) as any),
    ).rejects.toThrow("FAMILY_DUPLICATE: name taken");
  });

  // --- non-DomainError re-throw ---
  it("re-throws non-DomainError errors as-is", async () => {
    mockResolveUserId("u1");
    mockCreateFamilyExecute.mockRejectedValue(new Error("unexpected"));

    await expect(
      handler(createEvent("createFamily", { name: "X", themeName: "t", displayName: "D" }) as any),
    ).rejects.toThrow("unexpected");
  });

  // --- resolveUserId with missing identity ---
  it("resolveUserId uses empty string when identity is undefined", async () => {
    mockGetByCognitoSub.mockResolvedValue(undefined);

    const event = {
      info: { fieldName: "myFamilies" },
      arguments: {},
      identity: undefined,
    } as unknown;

    await expect(handler(event as any)).rejects.toThrow("USER_NOT_FOUND");
    expect(mockGetByCognitoSub).toHaveBeenCalledWith("");
  });
});
