import type { Reaction } from "@family-app/shared";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

import { DynamoReactionRepository } from "../reaction-repo";

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

describe("DynamoReactionRepository", () => {
  const repo = new DynamoReactionRepository();

  const postId = "post-1";

  const reaction1: Reaction = {
    postId,
    personId: "person-1",
    emoji: "👍",
    createdAt: "2026-01-01T10:00:00.000Z",
  };

  const reaction2: Reaction = {
    postId,
    personId: "person-2",
    emoji: "❤️",
    createdAt: "2026-01-01T10:01:00.000Z",
  };

  it("adds and retrieves reactions by post id", async () => {
    await repo.add(reaction1);
    await repo.add(reaction2);

    const reactions = await repo.getByPostId(postId);
    expect(reactions).toHaveLength(2);
  });

  it("returns correct reaction fields", async () => {
    const reactions = await repo.getByPostId(postId);
    const found = reactions.find((r) => r.personId === "person-1");
    expect(found).toBeDefined();
    expect(found?.postId).toBe(postId);
    expect(found?.emoji).toBe("👍");
    expect(found?.createdAt).toBe("2026-01-01T10:00:00.000Z");
  });

  it("returns empty array for post with no reactions", async () => {
    const reactions = await repo.getByPostId("no-reactions-post");
    expect(reactions).toHaveLength(0);
  });

  it("overwrites reaction when same person reacts again", async () => {
    const updatedReaction: Reaction = {
      postId,
      personId: "person-1",
      emoji: "😂",
      createdAt: "2026-01-01T10:05:00.000Z",
    };
    await repo.add(updatedReaction);

    const reactions = await repo.getByPostId(postId);
    expect(reactions).toHaveLength(2);
    const found = reactions.find((r) => r.personId === "person-1");
    expect(found?.emoji).toBe("😂");
  });

  it("removes a reaction", async () => {
    await repo.remove(postId, "person-1");

    const reactions = await repo.getByPostId(postId);
    expect(reactions).toHaveLength(1);
    expect(reactions[0]?.personId).toBe("person-2");
  });

  it("handles removing non-existent reaction gracefully", async () => {
    await repo.remove(postId, "non-existent-person");
    const reactions = await repo.getByPostId(postId);
    expect(reactions).toHaveLength(1);
  });
});
