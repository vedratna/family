import { describe, it, expect, vi } from "vitest";

import type { IMediaRepository } from "../../../repositories/interfaces/media-repo";
import { ConfirmMediaUpload } from "../confirm-media-upload";

function mockMediaRepo(): IMediaRepository {
  return {
    create: vi.fn(),
    getById: vi.fn(),
    getByFamily: vi.fn(),
  };
}

describe("ConfirmMediaUpload", () => {
  it("creates media record and returns it", async () => {
    const repo = mockMediaRepo();
    const uc = new ConfirmMediaUpload(repo);

    const result = await uc.execute({
      s3Key: "media/f1/photo.jpg",
      contentType: "image/jpeg",
      sizeBytes: 1024,
      uploadedBy: "u1",
      familyId: "f1",
    });

    expect(result.s3Key).toBe("media/f1/photo.jpg");
    expect(result.contentType).toBe("image/jpeg");
    expect(result.sizeBytes).toBe(1024);
    expect(result.uploadedBy).toBe("u1");
    expect(result.familyId).toBe("f1");
    expect(result.id).toBeDefined();
    expect(repo.create).toHaveBeenCalledOnce();
  });
});
