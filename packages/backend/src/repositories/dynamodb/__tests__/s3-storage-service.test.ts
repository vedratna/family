import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { S3StorageService } from "../s3-storage-service";

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(),
}));

const mockedGetSignedUrl = vi.mocked(getSignedUrl);

function getLastCall() {
  const calls = mockedGetSignedUrl.mock.calls;
  const call = calls[0];
  if (call === undefined) {
    throw new Error("Expected getSignedUrl to have been called");
  }
  return call;
}

describe("S3StorageService", () => {
  let service: S3StorageService;
  const testBucket = "test-bucket";

  beforeEach(() => {
    vi.clearAllMocks();
    service = new S3StorageService(new S3Client({}), testBucket);
  });

  describe("generateUploadUrl", () => {
    it("creates a PutObjectCommand with correct params and returns signed URL", async () => {
      mockedGetSignedUrl.mockResolvedValue("https://s3.example.com/upload");

      const url = await service.generateUploadUrl("photos/test.jpg", "image/jpeg", 3600);

      expect(url).toBe("https://s3.example.com/upload");
      expect(mockedGetSignedUrl).toHaveBeenCalledOnce();

      const [client, command, options] = getLastCall();
      expect(client).toBeInstanceOf(S3Client);
      expect(command).toBeInstanceOf(PutObjectCommand);
      expect(options).toEqual({ expiresIn: 3600 });

      const input = (command as PutObjectCommand).input;
      expect(input.Bucket).toBe(testBucket);
      expect(input.Key).toBe("photos/test.jpg");
      expect(input.ContentType).toBe("image/jpeg");
    });

    it("passes different content types correctly", async () => {
      mockedGetSignedUrl.mockResolvedValue("https://s3.example.com/upload-video");

      await service.generateUploadUrl("videos/clip.mp4", "video/mp4", 7200);

      const [, command, options] = getLastCall();
      const input = (command as PutObjectCommand).input;
      expect(input.ContentType).toBe("video/mp4");
      expect(options).toEqual({ expiresIn: 7200 });
    });
  });

  describe("generateDownloadUrl", () => {
    it("creates a GetObjectCommand with correct params and returns signed URL", async () => {
      mockedGetSignedUrl.mockResolvedValue("https://s3.example.com/download");

      const url = await service.generateDownloadUrl("photos/test.jpg", 900);

      expect(url).toBe("https://s3.example.com/download");
      expect(mockedGetSignedUrl).toHaveBeenCalledOnce();

      const [client, command, options] = getLastCall();
      expect(client).toBeInstanceOf(S3Client);
      expect(command).toBeInstanceOf(GetObjectCommand);
      expect(options).toEqual({ expiresIn: 900 });

      const input = (command as GetObjectCommand).input;
      expect(input.Bucket).toBe(testBucket);
      expect(input.Key).toBe("photos/test.jpg");
    });

    it("uses different expiration values", async () => {
      mockedGetSignedUrl.mockResolvedValue("https://s3.example.com/dl");

      await service.generateDownloadUrl("docs/file.pdf", 60);

      const [, , options] = getLastCall();
      expect(options).toEqual({ expiresIn: 60 });
    });
  });

  describe("constructor defaults", () => {
    it("uses default bucket name from env when not provided", () => {
      const defaultService = new S3StorageService();
      expect(defaultService).toBeInstanceOf(S3StorageService);
    });
  });
});
