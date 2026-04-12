import type { Media } from "@family-app/shared";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

import { DynamoMediaRepository } from "../media-repo";

import { createTestTable, deleteTestTable, getTestTableName } from "./test-helpers";

const TABLE_NAME = getTestTableName();

beforeAll(async () => {
  process.env["DYNAMODB_ENDPOINT"] = "http://localhost:8000";
  process.env["TABLE_NAME"] = TABLE_NAME;
  await createTestTable(TABLE_NAME);
});

afterAll(async () => {
  await deleteTestTable(TABLE_NAME);
});

describe("DynamoMediaRepository", () => {
  const repo = new DynamoMediaRepository();
  const familyId = "family-1";

  const media1: Media = {
    id: "media-1",
    s3Key: "uploads/family-1/photo-1.jpg",
    contentType: "image/jpeg",
    sizeBytes: 1024000,
    uploadedBy: "person-a",
    familyId,
    createdAt: new Date().toISOString(),
  };

  const media2: Media = {
    id: "media-2",
    s3Key: "uploads/family-1/video-1.mp4",
    contentType: "video/mp4",
    sizeBytes: 5120000,
    uploadedBy: "person-b",
    familyId,
    createdAt: new Date().toISOString(),
  };

  const mediaOtherFamily: Media = {
    id: "media-3",
    s3Key: "uploads/family-2/photo-1.jpg",
    contentType: "image/png",
    sizeBytes: 2048000,
    uploadedBy: "person-c",
    familyId: "family-2",
    createdAt: new Date().toISOString(),
  };

  it("creates and retrieves media by id", async () => {
    await repo.create(media1);
    const found = await repo.getById("media-1");
    expect(found).toBeDefined();
    expect(found?.s3Key).toBe("uploads/family-1/photo-1.jpg");
    expect(found?.contentType).toBe("image/jpeg");
    expect(found?.sizeBytes).toBe(1024000);
    expect(found?.uploadedBy).toBe("person-a");
    expect(found?.familyId).toBe(familyId);
  });

  it("returns undefined for non-existent media", async () => {
    const found = await repo.getById("non-existent");
    expect(found).toBeUndefined();
  });

  it("retrieves media by family", async () => {
    await repo.create(media2);
    const results = await repo.getByFamily(familyId);
    expect(results.length).toBe(2);
  });

  it("getByFamily only returns media for the given family", async () => {
    await repo.create(mediaOtherFamily);
    const results1 = await repo.getByFamily(familyId);
    expect(results1.length).toBe(2);

    const results2 = await repo.getByFamily("family-2");
    expect(results2.length).toBe(1);
    expect(results2[0]?.id).toBe("media-3");
  });

  it("getById resolves across families via lookup item", async () => {
    const found = await repo.getById("media-3");
    expect(found).toBeDefined();
    expect(found?.familyId).toBe("family-2");
    expect(found?.contentType).toBe("image/png");
  });

  it("returns empty array for family with no media", async () => {
    const results = await repo.getByFamily("no-such-family");
    expect(results).toEqual([]);
  });
});
