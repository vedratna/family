import { describe, it, expect, vi, beforeEach } from "vitest";

import { uploadMedia } from "../upload";

describe("uploadMedia", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  function makeFile(name = "photo.jpg", type = "image/jpeg", size = 1024): File {
    const content = "x".repeat(size);
    return new File([content], name, { type });
  }

  const mockGenerateUploadUrl = vi.fn();
  const mockConfirmMediaUpload = vi.fn();

  it("uploads a file successfully", async () => {
    mockGenerateUploadUrl.mockResolvedValue({
      data: {
        generateUploadUrl: {
          uploadUrl: "https://s3.example.com/upload",
          s3Key: "media/test-key.jpg",
        },
      },
    });

    mockFetch.mockResolvedValue({ ok: true });

    mockConfirmMediaUpload.mockResolvedValue({
      data: {
        confirmMediaUpload: { id: "media-123" },
      },
    });

    const result = await uploadMedia(
      makeFile(),
      "family-1",
      mockGenerateUploadUrl,
      mockConfirmMediaUpload,
    );

    expect(result).toEqual({
      id: "media-123",
      s3Key: "media/test-key.jpg",
      contentType: "image/jpeg",
    });

    expect(mockGenerateUploadUrl).toHaveBeenCalledWith({
      familyId: "family-1",
      contentType: "image/jpeg",
      sizeBytes: 1024,
    });

    expect(mockFetch).toHaveBeenCalledWith("https://s3.example.com/upload", {
      method: "PUT",
      body: expect.any(File),
      headers: { "Content-Type": "image/jpeg" },
    });

    expect(mockConfirmMediaUpload).toHaveBeenCalledWith({
      input: {
        s3Key: "media/test-key.jpg",
        contentType: "image/jpeg",
        sizeBytes: 1024,
        familyId: "family-1",
      },
    });
  });

  it("throws when generateUploadUrl fails", async () => {
    mockGenerateUploadUrl.mockResolvedValue({
      error: { message: "fail" },
    });

    await expect(
      uploadMedia(makeFile(), "family-1", mockGenerateUploadUrl, mockConfirmMediaUpload),
    ).rejects.toThrow("Failed to get upload URL");
  });

  it("throws when S3 PUT fails", async () => {
    mockGenerateUploadUrl.mockResolvedValue({
      data: {
        generateUploadUrl: {
          uploadUrl: "https://s3.example.com/upload",
          s3Key: "media/test-key.jpg",
        },
      },
    });

    mockFetch.mockResolvedValue({ ok: false, statusText: "Forbidden" });

    await expect(
      uploadMedia(makeFile(), "family-1", mockGenerateUploadUrl, mockConfirmMediaUpload),
    ).rejects.toThrow("S3 upload failed: Forbidden");
  });

  it("throws when confirmMediaUpload fails", async () => {
    mockGenerateUploadUrl.mockResolvedValue({
      data: {
        generateUploadUrl: {
          uploadUrl: "https://s3.example.com/upload",
          s3Key: "media/test-key.jpg",
        },
      },
    });

    mockFetch.mockResolvedValue({ ok: true });

    mockConfirmMediaUpload.mockResolvedValue({
      error: { message: "fail" },
    });

    await expect(
      uploadMedia(makeFile(), "family-1", mockGenerateUploadUrl, mockConfirmMediaUpload),
    ).rejects.toThrow("Failed to confirm upload");
  });
});
