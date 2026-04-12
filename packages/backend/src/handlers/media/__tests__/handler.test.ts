import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock repositories & use cases ---
const { mockGetByCognitoSub, mockGenerateUploadUrlExecute, mockConfirmMediaUploadExecute } =
  vi.hoisted(() => ({
    mockGetByCognitoSub: vi.fn(),
    mockGenerateUploadUrlExecute: vi.fn(),
    mockConfirmMediaUploadExecute: vi.fn(),
  }));

vi.mock("../../../repositories/dynamodb/user-repo", () => ({
  DynamoUserRepository: vi.fn().mockImplementation(() => ({
    getByCognitoSub: mockGetByCognitoSub,
  })),
}));

vi.mock("../../../repositories/dynamodb/media-repo", () => ({
  DynamoMediaRepository: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("../../../repositories/dynamodb/s3-storage-service", () => ({
  S3StorageService: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("../../../use-cases/media", () => ({
  GenerateUploadUrl: vi.fn().mockImplementation(() => ({
    execute: mockGenerateUploadUrlExecute,
  })),
  ConfirmMediaUpload: vi.fn().mockImplementation(() => ({
    execute: mockConfirmMediaUploadExecute,
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

describe("media handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- generateUploadUrl ---
  describe("generateUploadUrl", () => {
    it("generates upload url with resolved userId", async () => {
      mockResolveUserId("u1");
      const urlResult = { uploadUrl: "https://s3...", s3Key: "key" };
      mockGenerateUploadUrlExecute.mockResolvedValue(urlResult);

      const result = await handler(
        createEvent("generateUploadUrl", {
          familyId: "f1",
          contentType: "image/png",
          sizeBytes: 1024,
        }) as any,
      );

      expect(mockGenerateUploadUrlExecute).toHaveBeenCalledWith({
        familyId: "f1",
        contentType: "image/png",
        sizeBytes: 1024,
        userId: "u1",
      });
      expect(result).toEqual(urlResult);
    });
  });

  // --- confirmMediaUpload ---
  describe("confirmMediaUpload", () => {
    it("confirms upload with resolved userId", async () => {
      mockResolveUserId("u1");
      const media = { id: "m1" };
      mockConfirmMediaUploadExecute.mockResolvedValue(media);

      const result = await handler(
        createEvent("confirmMediaUpload", {
          s3Key: "key.png",
          contentType: "image",
          sizeBytes: 2048,
          familyId: "f1",
        }) as any,
      );

      expect(mockConfirmMediaUploadExecute).toHaveBeenCalledWith({
        s3Key: "key.png",
        contentType: "image",
        sizeBytes: 2048,
        uploadedBy: "u1",
        familyId: "f1",
      });
      expect(result).toEqual(media);
    });
  });

  // --- resolveUserId error paths ---
  describe("resolveUserId", () => {
    it("throws when user not found", async () => {
      mockGetByCognitoSub.mockResolvedValue(undefined);

      await expect(
        handler(
          createEvent("generateUploadUrl", {
            familyId: "f1",
            contentType: "image/png",
            sizeBytes: 1024,
          }) as any,
        ),
      ).rejects.toThrow("USER_NOT_FOUND");
    });

    it("uses empty string when identity is undefined", async () => {
      mockGetByCognitoSub.mockResolvedValue(undefined);

      const event = {
        info: { fieldName: "generateUploadUrl" },
        arguments: { familyId: "f1", contentType: "image/png", sizeBytes: 1024 },
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
    const domainErr = new (DomainError as any)("file too large", "MEDIA_TOO_LARGE");
    mockGenerateUploadUrlExecute.mockRejectedValue(domainErr);

    await expect(
      handler(
        createEvent("generateUploadUrl", {
          familyId: "f1",
          contentType: "image/png",
          sizeBytes: 1024,
        }) as any,
      ),
    ).rejects.toThrow("MEDIA_TOO_LARGE: file too large");
  });

  it("re-throws non-DomainError errors as-is", async () => {
    mockResolveUserId("u1");
    mockGenerateUploadUrlExecute.mockRejectedValue(new Error("boom"));

    await expect(
      handler(
        createEvent("generateUploadUrl", {
          familyId: "f1",
          contentType: "image/png",
          sizeBytes: 1024,
        }) as any,
      ),
    ).rejects.toThrow("boom");
  });
});
