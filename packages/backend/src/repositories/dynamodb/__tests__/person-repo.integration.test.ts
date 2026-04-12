import type { Person } from "@family-app/shared";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

import { DynamoPersonRepository } from "../person-repo";

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

describe("DynamoPersonRepository", () => {
  const repo = new DynamoPersonRepository();

  const testPerson: Person = {
    id: "person-1",
    familyId: "family-1",
    userId: "user-1",
    name: "Alice Smith",
    profilePhotoKey: "photos/alice.jpg",
    createdAt: new Date().toISOString(),
  };

  const testPersonNoUser: Person = {
    id: "person-2",
    familyId: "family-1",
    name: "Baby Smith",
    createdAt: new Date().toISOString(),
  };

  it("creates and retrieves a person by id", async () => {
    await repo.create(testPerson);
    const found = await repo.getById("family-1", "person-1");
    expect(found).toBeDefined();
    expect(found?.name).toBe("Alice Smith");
    expect(found?.userId).toBe("user-1");
    expect(found?.profilePhotoKey).toBe("photos/alice.jpg");
  });

  it("creates a person without optional fields", async () => {
    await repo.create(testPersonNoUser);
    const found = await repo.getById("family-1", "person-2");
    expect(found).toBeDefined();
    expect(found?.name).toBe("Baby Smith");
    expect(found?.userId).toBeUndefined();
    expect(found?.profilePhotoKey).toBeUndefined();
  });

  it("returns undefined for non-existent person", async () => {
    const found = await repo.getById("family-1", "non-existent");
    expect(found).toBeUndefined();
  });

  it("gets all persons by family id", async () => {
    const persons = await repo.getByFamilyId("family-1");
    expect(persons).toHaveLength(2);
    const names = persons.map((p) => p.name).sort();
    expect(names).toEqual(["Alice Smith", "Baby Smith"]);
  });

  it("returns empty array for family with no persons", async () => {
    const persons = await repo.getByFamilyId("non-existent-family");
    expect(persons).toHaveLength(0);
  });

  it("gets a person by user id", async () => {
    const found = await repo.getByUserId("family-1", "user-1");
    expect(found).toBeDefined();
    expect(found?.name).toBe("Alice Smith");
  });

  it("returns undefined for non-existent user id", async () => {
    const found = await repo.getByUserId("family-1", "non-existent");
    expect(found).toBeUndefined();
  });

  it("updates name and verifies change", async () => {
    await repo.update("family-1", "person-1", { name: "Alice Jones" });
    const found = await repo.getById("family-1", "person-1");
    expect(found?.name).toBe("Alice Jones");
    expect(found?.profilePhotoKey).toBe("photos/alice.jpg");
  });

  it("updates profilePhotoKey and verifies change", async () => {
    await repo.update("family-1", "person-1", { profilePhotoKey: "photos/alice-new.jpg" });
    const found = await repo.getById("family-1", "person-1");
    expect(found?.profilePhotoKey).toBe("photos/alice-new.jpg");
    expect(found?.name).toBe("Alice Jones");
  });

  it("deletes a person and verifies it is gone", async () => {
    await repo.delete("family-1", "person-1");
    const found = await repo.getById("family-1", "person-1");
    expect(found).toBeUndefined();
  });

  it("getByFamilyId reflects deletion", async () => {
    const persons = await repo.getByFamilyId("family-1");
    expect(persons).toHaveLength(1);
    expect(persons[0]?.name).toBe("Baby Smith");
  });
});
