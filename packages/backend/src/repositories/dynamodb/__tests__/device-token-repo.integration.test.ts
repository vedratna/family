import type { DeviceToken } from "@family-app/shared";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

import { DynamoDeviceTokenRepository } from "../device-token-repo";

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

describe("DynamoDeviceTokenRepository", () => {
  const repo = new DynamoDeviceTokenRepository();
  const userId = "user-1";

  const token1: DeviceToken = {
    userId,
    deviceToken: "token-abc-123",
    platform: "ios",
    createdAt: new Date().toISOString(),
  };

  const token2: DeviceToken = {
    userId,
    deviceToken: "token-def-456",
    platform: "android",
    createdAt: new Date().toISOString(),
  };

  it("registers and retrieves a device token", async () => {
    await repo.register(token1);
    const results = await repo.getByUser(userId);
    expect(results.length).toBe(1);
    expect(results[0]?.deviceToken).toBe("token-abc-123");
    expect(results[0]?.platform).toBe("ios");
  });

  it("registers multiple tokens for one user", async () => {
    await repo.register(token2);
    const results = await repo.getByUser(userId);
    expect(results.length).toBe(2);
    const platforms = results.map((t) => t.platform).sort();
    expect(platforms).toEqual(["android", "ios"]);
  });

  it("re-registering same token overwrites", async () => {
    const updatedToken: DeviceToken = {
      ...token1,
      createdAt: new Date().toISOString(),
    };
    await repo.register(updatedToken);
    const results = await repo.getByUser(userId);
    expect(results.length).toBe(2);
  });

  it("returns empty array for user with no tokens", async () => {
    const results = await repo.getByUser("non-existent");
    expect(results).toEqual([]);
  });

  it("deletes a device token", async () => {
    await repo.delete(userId, "token-abc-123");
    const results = await repo.getByUser(userId);
    expect(results.length).toBe(1);
    expect(results[0]?.deviceToken).toBe("token-def-456");
  });

  it("deleting non-existent token does not throw", async () => {
    await expect(repo.delete(userId, "non-existent-token")).resolves.toBeUndefined();
  });

  it("deletes last token leaving empty results", async () => {
    await repo.delete(userId, "token-def-456");
    const results = await repo.getByUser(userId);
    expect(results).toEqual([]);
  });
});
