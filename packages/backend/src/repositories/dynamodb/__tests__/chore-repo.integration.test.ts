import type { Chore } from "@family-app/shared";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

import { DynamoChoreRepository } from "../chore-repo";

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

describe("DynamoChoreRepository", () => {
  const repo = new DynamoChoreRepository();
  const familyId = "family-1";

  const chore: Chore = {
    id: "chore-1",
    familyId,
    title: "Wash dishes",
    description: "After dinner",
    assigneePersonId: "person-a",
    dueDate: "2026-04-15",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const chore2: Chore = {
    id: "chore-2",
    familyId,
    title: "Take out trash",
    assigneePersonId: "person-b",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const choreWithOptionals: Chore = {
    id: "chore-3",
    familyId,
    title: "Mow lawn",
    assigneePersonId: "person-a",
    status: "pending",
    recurrenceRule: "FREQ=WEEKLY",
    rotationMembers: ["person-a", "person-b"],
    createdAt: new Date().toISOString(),
  };

  it("creates and retrieves a chore by id", async () => {
    await repo.create(chore);
    const found = await repo.getById(familyId, "chore-1");
    expect(found).toBeDefined();
    expect(found?.title).toBe("Wash dishes");
    expect(found?.description).toBe("After dinner");
    expect(found?.assigneePersonId).toBe("person-a");
    expect(found?.dueDate).toBe("2026-04-15");
    expect(found?.status).toBe("pending");
  });

  it("returns undefined for non-existent chore", async () => {
    const found = await repo.getById(familyId, "non-existent");
    expect(found).toBeUndefined();
  });

  it("creates a chore without optional fields", async () => {
    await repo.create(chore2);
    const found = await repo.getById(familyId, "chore-2");
    expect(found).toBeDefined();
    expect(found?.title).toBe("Take out trash");
    expect(found?.description).toBeUndefined();
    expect(found?.dueDate).toBeUndefined();
    expect(found?.recurrenceRule).toBeUndefined();
    expect(found?.rotationMembers).toBeUndefined();
    expect(found?.completedAt).toBeUndefined();
  });

  it("creates a chore with recurrence and rotation", async () => {
    await repo.create(choreWithOptionals);
    const found = await repo.getById(familyId, "chore-3");
    expect(found).toBeDefined();
    expect(found?.recurrenceRule).toBe("FREQ=WEEKLY");
    expect(found?.rotationMembers).toEqual(["person-a", "person-b"]);
  });

  it("retrieves all chores by family", async () => {
    const results = await repo.getByFamily(familyId);
    expect(results.length).toBe(3);
  });

  it("retrieves chores by assignee", async () => {
    const resultsA = await repo.getByAssignee(familyId, "person-a");
    expect(resultsA.length).toBe(2);

    const resultsB = await repo.getByAssignee(familyId, "person-b");
    expect(resultsB.length).toBe(1);
    expect(resultsB[0]?.title).toBe("Take out trash");
  });

  it("returns empty array for assignee with no chores", async () => {
    const results = await repo.getByAssignee(familyId, "non-existent");
    expect(results).toEqual([]);
  });

  it("updates chore fields", async () => {
    await repo.update(familyId, "chore-1", {
      title: "Wash all dishes",
      status: "completed",
      completedAt: new Date().toISOString(),
    });
    const found = await repo.getById(familyId, "chore-1");
    expect(found?.title).toBe("Wash all dishes");
    expect(found?.status).toBe("completed");
    expect(found?.completedAt).toBeDefined();
    expect(found?.description).toBe("After dinner");
  });

  it("deletes a chore", async () => {
    await repo.delete(familyId, "chore-1");
    const found = await repo.getById(familyId, "chore-1");
    expect(found).toBeUndefined();
  });

  it("getByFamily reflects deletions", async () => {
    const results = await repo.getByFamily(familyId);
    expect(results.length).toBe(2);
  });
});
