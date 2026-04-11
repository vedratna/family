import { describe, it, expect, vi } from "vitest";

import { ValidationError } from "../../../domain/errors";
import type { IStorageService } from "../../../repositories/interfaces/media-repo";
import { GenerateUploadUrl } from "../generate-upload-url";

function mockStorageService(): IStorageService {
  return {
    generateUploadUrl: vi.fn().mockResolvedValue("https://s3.amazonaws.com/presigned-upload-url"),
    generateDownloadUrl: vi.fn(),
  };
}

describe("GenerateUploadUrl", () => {
  it("generates a presigned URL for a valid image type", async () => {
    const storage = mockStorageService();
    const useCase = new GenerateUploadUrl(storage);

    const result = await useCase.execute({
      familyId: "fam-1",
      contentType: "image/jpeg",
      sizeBytes: 1024 * 1024,
      userId: "user-1",
    });

    expect(result.uploadUrl).toBe("https://s3.amazonaws.com/presigned-upload-url");
    expect(result.s3Key).toMatch(/^families\/fam-1\/media\/.+\.jpeg$/);
    expect(storage.generateUploadUrl).toHaveBeenCalledOnce();
  });

  it("generates a presigned URL for video/mp4", async () => {
    const storage = mockStorageService();
    const useCase = new GenerateUploadUrl(storage);

    const result = await useCase.execute({
      familyId: "fam-1",
      contentType: "video/mp4",
      sizeBytes: 50 * 1024 * 1024,
      userId: "user-1",
    });

    expect(result.s3Key).toMatch(/\.mp4$/);
  });

  it("rejects unsupported file type", async () => {
    const storage = mockStorageService();
    const useCase = new GenerateUploadUrl(storage);

    await expect(
      useCase.execute({
        familyId: "fam-1",
        contentType: "application/exe",
        sizeBytes: 1024,
        userId: "user-1",
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("rejects file exceeding 500MB", async () => {
    const storage = mockStorageService();
    const useCase = new GenerateUploadUrl(storage);

    await expect(
      useCase.execute({
        familyId: "fam-1",
        contentType: "video/mp4",
        sizeBytes: 600 * 1024 * 1024,
        userId: "user-1",
      }),
    ).rejects.toThrow(ValidationError);
  });
});
