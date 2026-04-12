import type { FamilyMembership } from "@family-app/shared";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

import { DynamoMembershipRepository } from "../membership-repo";

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

describe("DynamoMembershipRepository", () => {
  const repo = new DynamoMembershipRepository();

  const membership1: FamilyMembership = {
    familyId: "family-1",
    personId: "person-1",
    userId: "user-1",
    role: "admin",
    joinedAt: new Date().toISOString(),
  };

  const membership2: FamilyMembership = {
    familyId: "family-1",
    personId: "person-2",
    userId: "user-2",
    role: "editor",
    joinedAt: new Date().toISOString(),
  };

  const membership3: FamilyMembership = {
    familyId: "family-2",
    personId: "person-3",
    userId: "user-1",
    role: "viewer",
    joinedAt: new Date().toISOString(),
  };

  it("creates and retrieves a membership by family and person", async () => {
    await repo.create(membership1);
    const found = await repo.getByFamilyAndPerson("family-1", "person-1");
    expect(found).toBeDefined();
    expect(found?.userId).toBe("user-1");
    expect(found?.role).toBe("admin");
  });

  it("returns undefined for non-existent membership", async () => {
    const found = await repo.getByFamilyAndPerson("family-1", "non-existent");
    expect(found).toBeUndefined();
  });

  it("gets all memberships by family id", async () => {
    await repo.create(membership2);
    const memberships = await repo.getByFamilyId("family-1");
    expect(memberships).toHaveLength(2);
    const personIds = memberships.map((m) => m.personId).sort();
    expect(personIds).toEqual(["person-1", "person-2"]);
  });

  it("returns empty array for family with no memberships", async () => {
    const memberships = await repo.getByFamilyId("non-existent-family");
    expect(memberships).toHaveLength(0);
  });

  it("gets all memberships by user id", async () => {
    await repo.create(membership3);
    const memberships = await repo.getByUserId("user-1");
    expect(memberships).toHaveLength(2);
    const familyIds = memberships.map((m) => m.familyId).sort();
    expect(familyIds).toEqual(["family-1", "family-2"]);
  });

  it("returns empty array for user with no memberships", async () => {
    const memberships = await repo.getByUserId("non-existent-user");
    expect(memberships).toHaveLength(0);
  });

  it("counts active members", async () => {
    const count = await repo.countActiveMembers("family-1");
    expect(count).toBe(2);
  });

  it("returns zero count for family with no members", async () => {
    const count = await repo.countActiveMembers("non-existent-family");
    expect(count).toBe(0);
  });

  it("updates role and verifies change", async () => {
    await repo.updateRole("family-1", "person-2", "admin");
    const found = await repo.getByFamilyAndPerson("family-1", "person-2");
    expect(found?.role).toBe("admin");
    expect(found?.userId).toBe("user-2");
  });

  it("deletes a membership and verifies it is gone", async () => {
    await repo.delete("family-1", "person-2");
    const found = await repo.getByFamilyAndPerson("family-1", "person-2");
    expect(found).toBeUndefined();
  });

  it("countActiveMembers reflects deletion", async () => {
    const count = await repo.countActiveMembers("family-1");
    expect(count).toBe(1);
  });
});
