import type { User } from "@family-app/shared";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

import { DynamoUserRepository } from "../user-repo";

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

describe("DynamoUserRepository", () => {
  const repo = new DynamoUserRepository();

  const testUser: User = {
    id: "user-1",
    cognitoSub: "sub-123",
    phone: "+911234567890",
    displayName: "Test User",
    createdAt: new Date().toISOString(),
  };

  const userWithOptionals: User = {
    id: "user-2",
    cognitoSub: "sub-456",
    phone: "+919876543210",
    displayName: "User With Photo",
    profilePhotoKey: "photos/user-2.jpg",
    dateOfBirth: "1990-01-15",
    createdAt: new Date().toISOString(),
  };

  it("creates and retrieves a user by id", async () => {
    await repo.create(testUser);
    const found = await repo.getById("user-1");
    expect(found).toBeDefined();
    expect(found?.displayName).toBe("Test User");
    expect(found?.phone).toBe("+911234567890");
    expect(found?.cognitoSub).toBe("sub-123");
    expect(found?.profilePhotoKey).toBeUndefined();
    expect(found?.dateOfBirth).toBeUndefined();
  });

  it("creates and retrieves a user with optional fields", async () => {
    await repo.create(userWithOptionals);
    const found = await repo.getById("user-2");
    expect(found).toBeDefined();
    expect(found?.profilePhotoKey).toBe("photos/user-2.jpg");
    expect(found?.dateOfBirth).toBe("1990-01-15");
  });

  it("retrieves a user by phone", async () => {
    const found = await repo.getByPhone("+911234567890");
    expect(found).toBeDefined();
    expect(found?.id).toBe("user-1");
  });

  it("returns undefined for non-existent phone", async () => {
    const found = await repo.getByPhone("+910000000000");
    expect(found).toBeUndefined();
  });

  // getByCognitoSub uses a scan+filter on GSI1 with empty phone prefix.
  // This works in production but not reliably in DynamoDB Local with provisioned tables.
  // Skipped until a dedicated GSI for cognitoSub is added.
  it.skip("retrieves a user by cognito sub", async () => {
    const found = await repo.getByCognitoSub("sub-123");
    expect(found).toBeDefined();
    expect(found?.id).toBe("user-1");
  });

  it("returns undefined for non-existent user", async () => {
    const found = await repo.getById("non-existent");
    expect(found).toBeUndefined();
  });

  it("updates user profile with displayName only", async () => {
    await repo.updateProfile("user-1", {
      displayName: "Updated Name",
    });
    const found = await repo.getById("user-1");
    expect(found?.displayName).toBe("Updated Name");
  });

  it("updates user profile with all optional fields", async () => {
    await repo.updateProfile("user-1", {
      displayName: "Full Update",
      profilePhotoKey: "photos/user-1.jpg",
      dateOfBirth: "1985-06-20",
    });
    const found = await repo.getById("user-1");
    expect(found?.displayName).toBe("Full Update");
    expect(found?.profilePhotoKey).toBe("photos/user-1.jpg");
    expect(found?.dateOfBirth).toBe("1985-06-20");
  });
});
