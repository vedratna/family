import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock repositories & use cases ---
const {
  mockGetByCognitoSub,
  mockGetNotificationPreferencesExecute,
  mockUpdateNotificationPreferenceExecute,
  mockRegisterDeviceTokenExecute,
} = vi.hoisted(() => ({
  mockGetByCognitoSub: vi.fn(),
  mockGetNotificationPreferencesExecute: vi.fn(),
  mockUpdateNotificationPreferenceExecute: vi.fn(),
  mockRegisterDeviceTokenExecute: vi.fn(),
}));

vi.mock("../../../repositories/dynamodb/user-repo", () => ({
  DynamoUserRepository: vi.fn().mockImplementation(() => ({
    getByCognitoSub: mockGetByCognitoSub,
  })),
}));

vi.mock("../../../repositories/dynamodb/notification-pref-repo", () => ({
  DynamoNotificationPrefRepository: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("../../../repositories/dynamodb/device-token-repo", () => ({
  DynamoDeviceTokenRepository: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("../../../use-cases/notifications", () => ({
  GetNotificationPreferences: vi.fn().mockImplementation(() => ({
    execute: mockGetNotificationPreferencesExecute,
  })),
  UpdateNotificationPreference: vi.fn().mockImplementation(() => ({
    execute: mockUpdateNotificationPreferenceExecute,
  })),
  RegisterDeviceToken: vi.fn().mockImplementation(() => ({
    execute: mockRegisterDeviceTokenExecute,
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

function mockResolveUserId(userId = "user-123") {
  mockGetByCognitoSub.mockResolvedValue({ id: userId });
}

describe("notifications handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- notificationPreferences ---
  describe("notificationPreferences", () => {
    it("returns preferences for userId and familyId", async () => {
      mockResolveUserId("u1");
      const prefs = [{ category: "feed", enabled: true }];
      mockGetNotificationPreferencesExecute.mockResolvedValue(prefs);

      const result = await handler(
        createEvent("notificationPreferences", { familyId: "f1" }) as any,
      );

      expect(mockGetNotificationPreferencesExecute).toHaveBeenCalledWith("u1", "f1");
      expect(result).toEqual(prefs);
    });
  });

  // --- updateNotificationPreference ---
  describe("updateNotificationPreference", () => {
    it("updates preference and returns true", async () => {
      mockResolveUserId("u1");
      mockUpdateNotificationPreferenceExecute.mockResolvedValue(undefined);

      const result = await handler(
        createEvent("updateNotificationPreference", {
          familyId: "f1",
          category: "chores",
          enabled: false,
        }) as any,
      );

      expect(mockUpdateNotificationPreferenceExecute).toHaveBeenCalledWith({
        userId: "u1",
        familyId: "f1",
        category: "chores",
        enabled: false,
      });
      expect(result).toBe(true);
    });
  });

  // --- registerDeviceToken ---
  describe("registerDeviceToken", () => {
    it("registers device token and returns true", async () => {
      mockResolveUserId("u1");
      mockRegisterDeviceTokenExecute.mockResolvedValue(undefined);

      const result = await handler(
        createEvent("registerDeviceToken", {
          deviceToken: "token-abc",
          platform: "ios",
        }) as any,
      );

      expect(mockRegisterDeviceTokenExecute).toHaveBeenCalledWith({
        userId: "u1",
        deviceToken: "token-abc",
        platform: "ios",
      });
      expect(result).toBe(true);
    });

    it("works with android platform", async () => {
      mockResolveUserId("u1");
      mockRegisterDeviceTokenExecute.mockResolvedValue(undefined);

      const result = await handler(
        createEvent("registerDeviceToken", {
          deviceToken: "token-xyz",
          platform: "android",
        }) as any,
      );

      expect(mockRegisterDeviceTokenExecute).toHaveBeenCalledWith({
        userId: "u1",
        deviceToken: "token-xyz",
        platform: "android",
      });
      expect(result).toBe(true);
    });
  });

  // --- resolveUserId error paths ---
  describe("resolveUserId", () => {
    it("throws when user not found", async () => {
      mockGetByCognitoSub.mockResolvedValue(undefined);

      await expect(
        handler(createEvent("notificationPreferences", { familyId: "f1" }) as any),
      ).rejects.toThrow("USER_NOT_FOUND");
    });

    it("uses empty string when identity is undefined", async () => {
      mockGetByCognitoSub.mockResolvedValue(undefined);

      const event = {
        info: { fieldName: "notificationPreferences" },
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
    mockResolveUserId("u1");
    const domainErr = new (DomainError as any)("invalid category", "NOTIF_INVALID");
    mockUpdateNotificationPreferenceExecute.mockRejectedValue(domainErr);

    await expect(
      handler(
        createEvent("updateNotificationPreference", {
          familyId: "f1",
          category: "bad",
          enabled: true,
        }) as any,
      ),
    ).rejects.toThrow("NOTIF_INVALID: invalid category");
  });

  it("re-throws non-DomainError errors as-is", async () => {
    mockResolveUserId("u1");
    mockUpdateNotificationPreferenceExecute.mockRejectedValue(new Error("boom"));

    await expect(
      handler(
        createEvent("updateNotificationPreference", {
          familyId: "f1",
          category: "bad",
          enabled: true,
        }) as any,
      ),
    ).rejects.toThrow("boom");
  });
});
