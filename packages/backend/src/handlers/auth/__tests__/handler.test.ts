import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock repositories ---
const {
  mockGetByCognitoSub,
  mockGetByPhone,
  mockRegisterExecute,
  mockUpdateProfileExecute,
  mockGenerateDownloadUrl,
} = vi.hoisted(() => ({
  mockGetByCognitoSub: vi.fn(),
  mockGetByPhone: vi.fn(),
  mockRegisterExecute: vi.fn(),
  mockUpdateProfileExecute: vi.fn(),
  mockGenerateDownloadUrl: vi.fn(),
}));

vi.mock("../../../repositories/dynamodb/user-repo", () => ({
  DynamoUserRepository: vi.fn().mockImplementation(() => ({
    getByCognitoSub: mockGetByCognitoSub,
    getByPhone: mockGetByPhone,
  })),
}));

vi.mock("../../../repositories/dynamodb/s3-storage-service", () => ({
  S3StorageService: vi.fn().mockImplementation(() => ({
    generateDownloadUrl: mockGenerateDownloadUrl,
  })),
}));

vi.mock("../../../use-cases/auth", () => ({
  RegisterWithPhone: vi.fn().mockImplementation(() => ({
    execute: mockRegisterExecute,
  })),
  UpdateUserProfile: vi.fn().mockImplementation(() => ({
    execute: mockUpdateProfileExecute,
  })),
}));

// --- Mock DomainError so instanceof works ---
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

describe("auth handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- register ---
  describe("register", () => {
    it("calls RegisterWithPhone and returns user with profilePhotoUrl", async () => {
      const user = { id: "u1", phone: "+1234567890", displayName: "Test" };
      mockRegisterExecute.mockResolvedValue({ user });
      mockGenerateDownloadUrl.mockResolvedValue("https://s3.example.com/photo.jpg");

      const result = await handler(
        createEvent("register", {
          phone: "+1234567890",
          cognitoSub: "cog-sub-1",
          displayName: "Test",
        }) as any,
      );

      expect(mockRegisterExecute).toHaveBeenCalledWith({
        phone: "+1234567890",
        cognitoSub: "cog-sub-1",
        displayName: "Test",
      });
      expect(result).toEqual({ ...user, profilePhotoUrl: null });
    });
  });

  // --- updateProfile ---
  describe("updateProfile", () => {
    it("resolves user and calls UpdateUserProfile", async () => {
      mockGetByCognitoSub.mockResolvedValue({ id: "user-123" });
      const updatedUser = { id: "user-123", displayName: "New Name", profilePhotoKey: "key.jpg" };
      mockUpdateProfileExecute.mockResolvedValue({ user: updatedUser });
      mockGenerateDownloadUrl.mockResolvedValue("https://s3.example.com/key.jpg");

      const profile = { displayName: "New Name", profilePhotoKey: "key.jpg" };
      const result = await handler(createEvent("updateProfile", { profile }) as any);

      expect(mockGetByCognitoSub).toHaveBeenCalledWith("test-cognito-sub");
      expect(mockUpdateProfileExecute).toHaveBeenCalledWith({
        userId: "user-123",
        profile,
      });
      expect(result).toEqual({ ...updatedUser, profilePhotoUrl: "https://s3.example.com/key.jpg" });
    });

    it("throws when user not found", async () => {
      mockGetByCognitoSub.mockResolvedValue(undefined);

      await expect(handler(createEvent("updateProfile", { profile: {} }) as any)).rejects.toThrow(
        "USER_NOT_FOUND",
      );
    });

    it("uses empty string when identity sub is missing", async () => {
      mockGetByCognitoSub.mockResolvedValue(undefined);

      const event = {
        info: { fieldName: "updateProfile" },
        arguments: { profile: {} },
        identity: undefined,
      } as unknown;

      await expect(handler(event as any)).rejects.toThrow("USER_NOT_FOUND");
      expect(mockGetByCognitoSub).toHaveBeenCalledWith("");
    });
  });

  // --- userByPhone ---
  describe("userByPhone", () => {
    it("returns user with profilePhotoUrl when found", async () => {
      const user = {
        id: "u1",
        phone: "+1234567890",
        displayName: "Test",
        profilePhotoKey: "key.jpg",
      };
      mockGetByPhone.mockResolvedValue(user);
      mockGenerateDownloadUrl.mockResolvedValue("https://s3.example.com/key.jpg");

      const result = await handler(createEvent("userByPhone", { phone: "+1234567890" }) as any);

      expect(mockGetByPhone).toHaveBeenCalledWith("+1234567890");
      expect(result).toEqual({ ...user, profilePhotoUrl: "https://s3.example.com/key.jpg" });
    });

    it("returns null when user not found", async () => {
      mockGetByPhone.mockResolvedValue(undefined);

      const result = await handler(createEvent("userByPhone", { phone: "+0000000000" }) as any);

      expect(result).toBeNull();
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
    const domainErr = new (DomainError as any)("bad input", "AUTH_INVALID");
    mockRegisterExecute.mockRejectedValue(domainErr);

    await expect(
      handler(createEvent("register", { phone: "x", cognitoSub: "y", displayName: "z" }) as any),
    ).rejects.toThrow("AUTH_INVALID: bad input");
  });

  // --- non-DomainError re-throw ---
  it("re-throws non-DomainError errors as-is", async () => {
    mockRegisterExecute.mockRejectedValue(new Error("random failure"));

    await expect(
      handler(createEvent("register", { phone: "x", cognitoSub: "y", displayName: "z" }) as any),
    ).rejects.toThrow("random failure");
  });
});
