import { describe, it, expect, vi } from "vitest";

import { NotFoundError } from "../../../domain/errors";
import type {
  IMediaRepository,
  IStorageService,
} from "../../../repositories/interfaces/media-repo";
import type { IMembershipRepository } from "../../../repositories/interfaces/membership-repo";
import { GenerateDownloadUrl } from "../generate-download-url";

function mockMediaRepo(): IMediaRepository {
  return { create: vi.fn(), getById: vi.fn(), getByFamily: vi.fn() };
}

function mockStorageService(): IStorageService {
  return { generateUploadUrl: vi.fn(), generateDownloadUrl: vi.fn() };
}

function mockMembershipRepo(): IMembershipRepository {
  return {
    create: vi.fn(),
    getByFamilyId: vi.fn(),
    getByUserId: vi.fn(),
    getByFamilyAndPerson: vi.fn(),
    updateRole: vi.fn(),
    delete: vi.fn(),
    countActiveMembers: vi.fn(),
  };
}

describe("GenerateDownloadUrl", () => {
  it("returns a download URL for an authorized member", async () => {
    const mediaRepo = mockMediaRepo();
    const storage = mockStorageService();
    const memberRepo = mockMembershipRepo();

    vi.mocked(mediaRepo.getById).mockResolvedValue({
      id: "m1",
      s3Key: "media/f1/photo.jpg",
      contentType: "image/jpeg",
      sizeBytes: 1024,
      uploadedBy: "u1",
      familyId: "f1",
      createdAt: "",
    });
    vi.mocked(memberRepo.getByUserId).mockResolvedValue([
      { familyId: "f1", personId: "p1", userId: "u1", role: "editor", joinedAt: "" },
    ]);
    vi.mocked(storage.generateDownloadUrl).mockResolvedValue("https://signed-url");

    const uc = new GenerateDownloadUrl(mediaRepo, storage, memberRepo);
    const result = await uc.execute({ mediaId: "m1", requesterId: "u1" });

    expect(result).toBe("https://signed-url");
    expect(storage.generateDownloadUrl).toHaveBeenCalledWith("media/f1/photo.jpg", 3600);
  });

  it("throws NotFoundError when media does not exist", async () => {
    const mediaRepo = mockMediaRepo();
    vi.mocked(mediaRepo.getById).mockResolvedValue(undefined);

    const uc = new GenerateDownloadUrl(mediaRepo, mockStorageService(), mockMembershipRepo());
    await expect(uc.execute({ mediaId: "m-missing", requesterId: "u1" })).rejects.toThrow(
      NotFoundError,
    );
  });

  it("throws NotFoundError when requester is not a family member", async () => {
    const mediaRepo = mockMediaRepo();
    const memberRepo = mockMembershipRepo();

    vi.mocked(mediaRepo.getById).mockResolvedValue({
      id: "m1",
      s3Key: "media/f1/photo.jpg",
      contentType: "image/jpeg",
      sizeBytes: 1024,
      uploadedBy: "u1",
      familyId: "f1",
      createdAt: "",
    });
    vi.mocked(memberRepo.getByUserId).mockResolvedValue([
      { familyId: "f2", personId: "p9", userId: "u-outsider", role: "viewer", joinedAt: "" },
    ]);

    const uc = new GenerateDownloadUrl(mediaRepo, mockStorageService(), memberRepo);
    await expect(uc.execute({ mediaId: "m1", requesterId: "u-outsider" })).rejects.toThrow(
      NotFoundError,
    );
  });
});
