import type { Comment } from "@family-app/shared";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

import { DynamoCommentRepository } from "../comment-repo";

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

describe("DynamoCommentRepository", () => {
  const repo = new DynamoCommentRepository();

  const postId = "post-1";

  const comment1: Comment = {
    id: "comment-1",
    postId,
    personId: "person-1",
    textContent: "Great post!",
    createdAt: "2026-01-01T10:00:00.000Z",
  };

  const comment2: Comment = {
    id: "comment-2",
    postId,
    personId: "person-2",
    textContent: "Thanks for sharing",
    createdAt: "2026-01-01T11:00:00.000Z",
  };

  const comment3: Comment = {
    id: "comment-3",
    postId,
    personId: "person-1",
    textContent: "Third comment",
    createdAt: "2026-01-01T12:00:00.000Z",
  };

  it("creates and retrieves comments by post id", async () => {
    await repo.create(comment1);
    await repo.create(comment2);
    await repo.create(comment3);

    const result = await repo.getByPostId(postId, 10);
    expect(result.items).toHaveLength(3);
    expect(result.cursor).toBeUndefined();
  });

  it("returns comments in chronological order", async () => {
    const result = await repo.getByPostId(postId, 10);
    expect(result.items[0]?.id).toBe("comment-1");
    expect(result.items[1]?.id).toBe("comment-2");
    expect(result.items[2]?.id).toBe("comment-3");
  });

  it("paginates comments", async () => {
    const page1 = await repo.getByPostId(postId, 2);
    expect(page1.items).toHaveLength(2);
    expect(page1.items[0]?.id).toBe("comment-1");
    expect(page1.items[1]?.id).toBe("comment-2");
    expect(page1.cursor).toBeDefined();

    const page2 = await repo.getByPostId(postId, 2, page1.cursor);
    expect(page2.items).toHaveLength(1);
    expect(page2.items[0]?.id).toBe("comment-3");
    expect(page2.cursor).toBeUndefined();
  });

  it("returns empty result for post with no comments", async () => {
    const result = await repo.getByPostId("no-comments-post", 10);
    expect(result.items).toHaveLength(0);
    expect(result.cursor).toBeUndefined();
  });

  it("deletes a comment", async () => {
    await repo.delete(postId, comment3.createdAt, "comment-3");

    const result = await repo.getByPostId(postId, 10);
    expect(result.items).toHaveLength(2);
    expect(result.items.find((c) => c.id === "comment-3")).toBeUndefined();
  });

  it("preserves comment fields correctly", async () => {
    const result = await repo.getByPostId(postId, 10);
    const found = result.items.find((c) => c.id === "comment-1");
    expect(found).toBeDefined();
    expect(found?.postId).toBe(postId);
    expect(found?.personId).toBe("person-1");
    expect(found?.textContent).toBe("Great post!");
    expect(found?.createdAt).toBe("2026-01-01T10:00:00.000Z");
  });
});
