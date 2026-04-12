import type { Family } from "@family-app/shared";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

import { DynamoFamilyRepository } from "../family-repo";

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

describe("DynamoFamilyRepository", () => {
  const repo = new DynamoFamilyRepository();

  const testFamily: Family = {
    id: "family-1",
    name: "The Smiths",
    createdBy: "user-1",
    themeName: "teal",
    createdAt: new Date().toISOString(),
  };

  it("creates and retrieves a family by id", async () => {
    await repo.create(testFamily);
    const found = await repo.getById("family-1");
    expect(found).toBeDefined();
    expect(found?.name).toBe("The Smiths");
    expect(found?.createdBy).toBe("user-1");
    expect(found?.themeName).toBe("teal");
  });

  it("returns undefined for non-existent family", async () => {
    const found = await repo.getById("non-existent");
    expect(found).toBeUndefined();
  });

  it("updates theme and verifies change", async () => {
    await repo.updateTheme("family-1", "ocean");
    const found = await repo.getById("family-1");
    expect(found?.themeName).toBe("ocean");
    expect(found?.name).toBe("The Smiths");
  });

  it("deletes a family and verifies it is gone", async () => {
    await repo.delete("family-1");
    const found = await repo.getById("family-1");
    expect(found).toBeUndefined();
  });
});
