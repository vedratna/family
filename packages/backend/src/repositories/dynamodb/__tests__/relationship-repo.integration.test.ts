import type { Relationship } from "@family-app/shared";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

import { DynamoRelationshipRepository } from "../relationship-repo";

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

describe("DynamoRelationshipRepository", () => {
  const repo = new DynamoRelationshipRepository();
  const familyId = "family-1";

  const relationship: Relationship = {
    id: "rel-1",
    familyId,
    personAId: "person-a",
    personBId: "person-b",
    aToBLabel: "Father",
    bToALabel: "Son",
    type: "parent-child",
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  const pendingRelationship: Relationship = {
    id: "rel-2",
    familyId,
    personAId: "person-c",
    personBId: "person-d",
    aToBLabel: "Wife",
    bToALabel: "Husband",
    type: "spouse",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  it("creates and retrieves a relationship by id", async () => {
    await repo.create(relationship);
    const found = await repo.getById(familyId, "person-a", "person-b");
    expect(found).toBeDefined();
    expect(found?.aToBLabel).toBe("Father");
    expect(found?.bToALabel).toBe("Son");
    expect(found?.type).toBe("parent-child");
    expect(found?.status).toBe("confirmed");
    expect(found?.personAId).toBe("person-a");
    expect(found?.personBId).toBe("person-b");
  });

  it("returns undefined for non-existent relationship", async () => {
    const found = await repo.getById(familyId, "no-one", "no-two");
    expect(found).toBeUndefined();
  });

  it("retrieves relationships by family", async () => {
    await repo.create(pendingRelationship);
    const results = await repo.getByFamily(familyId);
    expect(results.length).toBe(2);
  });

  it("retrieves relationships by person (personA match)", async () => {
    const results = await repo.getByPerson(familyId, "person-a");
    expect(results.length).toBe(1);
    expect(results[0]?.personAId).toBe("person-a");
  });

  it("retrieves relationships by person (personB match)", async () => {
    const results = await repo.getByPerson(familyId, "person-b");
    expect(results.length).toBe(1);
    expect(results[0]?.personBId).toBe("person-b");
  });

  it("returns empty array when person has no relationships", async () => {
    const results = await repo.getByPerson(familyId, "non-existent");
    expect(results).toEqual([]);
  });

  it("updates relationship fields", async () => {
    await repo.update(familyId, "person-a", "person-b", {
      aToBLabel: "Dad",
      status: "pending",
    });
    const found = await repo.getById(familyId, "person-a", "person-b");
    expect(found?.aToBLabel).toBe("Dad");
    expect(found?.status).toBe("pending");
    expect(found?.bToALabel).toBe("Son");
  });

  it("retrieves pending relationships", async () => {
    const results = await repo.getPending(familyId);
    expect(results.length).toBe(2);
    for (const rel of results) {
      expect(rel.status).toBe("pending");
    }
  });

  it("deletes a relationship", async () => {
    await repo.delete(familyId, "person-a", "person-b");
    const found = await repo.getById(familyId, "person-a", "person-b");
    expect(found).toBeUndefined();
  });

  it("getByFamily reflects deletions", async () => {
    const results = await repo.getByFamily(familyId);
    expect(results.length).toBe(1);
  });
});
