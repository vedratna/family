import type { Post } from "@family-app/shared";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

import { DynamoPostRepository } from "../post-repo";

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

describe("DynamoPostRepository", () => {
  const repo = new DynamoPostRepository();

  const familyId = "family-1";

  const post1: Post = {
    id: "post-1",
    familyId,
    authorPersonId: "person-1",
    textContent: "Hello family!",
    isSystemPost: false,
    createdAt: "2026-01-01T10:00:00.000Z",
  };

  const post2: Post = {
    id: "post-2",
    familyId,
    authorPersonId: "person-2",
    textContent: "Second post",
    isSystemPost: false,
    createdAt: "2026-01-01T11:00:00.000Z",
  };

  const post3: Post = {
    id: "post-3",
    familyId,
    authorPersonId: "person-1",
    textContent: "System notification",
    isSystemPost: true,
    createdAt: "2026-01-01T12:00:00.000Z",
  };

  it("creates and retrieves a post by id", async () => {
    await repo.create(post1);
    const found = await repo.getById("post-1");
    expect(found).toBeDefined();
    expect(found?.textContent).toBe("Hello family!");
    expect(found?.authorPersonId).toBe("person-1");
    expect(found?.familyId).toBe(familyId);
    expect(found?.isSystemPost).toBe(false);
  });

  it("returns undefined for non-existent post", async () => {
    const found = await repo.getById("non-existent");
    expect(found).toBeUndefined();
  });

  it("retrieves family feed in reverse chronological order", async () => {
    await repo.create(post2);
    await repo.create(post3);

    const feed = await repo.getFamilyFeed(familyId, 10);
    expect(feed.items).toHaveLength(3);
    expect(feed.items[0]?.id).toBe("post-3");
    expect(feed.items[1]?.id).toBe("post-2");
    expect(feed.items[2]?.id).toBe("post-1");
    expect(feed.cursor).toBeUndefined();
  });

  it("paginates the family feed", async () => {
    const page1 = await repo.getFamilyFeed(familyId, 2);
    expect(page1.items).toHaveLength(2);
    expect(page1.items[0]?.id).toBe("post-3");
    expect(page1.items[1]?.id).toBe("post-2");
    expect(page1.cursor).toBeDefined();

    const page2 = await repo.getFamilyFeed(familyId, 2, page1.cursor);
    expect(page2.items).toHaveLength(1);
    expect(page2.items[0]?.id).toBe("post-1");
    expect(page2.cursor).toBeUndefined();
  });

  it("returns empty feed for family with no posts", async () => {
    const feed = await repo.getFamilyFeed("no-posts-family", 10);
    expect(feed.items).toHaveLength(0);
    expect(feed.cursor).toBeUndefined();
  });

  it("deletes a post and its lookup item", async () => {
    await repo.delete(familyId, post3.createdAt, "post-3");

    const found = await repo.getById("post-3");
    expect(found).toBeUndefined();

    const feed = await repo.getFamilyFeed(familyId, 10);
    expect(feed.items).toHaveLength(2);
  });
});
