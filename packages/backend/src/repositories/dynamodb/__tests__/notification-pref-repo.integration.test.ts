import type { NotificationPreference } from "@family-app/shared";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

import { DynamoNotificationPrefRepository } from "../notification-pref-repo";

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

describe("DynamoNotificationPrefRepository", () => {
  const repo = new DynamoNotificationPrefRepository();
  const userId = "user-1";
  const familyId1 = "family-1";
  const familyId2 = "family-2";

  const pref: NotificationPreference = {
    userId,
    familyId: familyId1,
    category: "events-reminders",
    enabled: true,
  };

  it("upserts and retrieves a preference", async () => {
    await repo.upsert(pref);
    const results = await repo.getByUser(userId);
    expect(results.length).toBe(1);
    expect(results[0]?.category).toBe("events-reminders");
    expect(results[0]?.enabled).toBe(true);
  });

  it("upserts overwrites existing preference", async () => {
    await repo.upsert({ ...pref, enabled: false });
    const results = await repo.getByUserAndFamily(userId, familyId1);
    expect(results.length).toBe(1);
    expect(results[0]?.enabled).toBe(false);
  });

  it("sets default preferences for a family", async () => {
    await repo.setDefaults(userId, familyId2);
    const results = await repo.getByUserAndFamily(userId, familyId2);
    expect(results.length).toBe(4);
    for (const r of results) {
      expect(r.enabled).toBe(true);
      expect(r.familyId).toBe(familyId2);
      expect(r.userId).toBe(userId);
    }
    const categories = results.map((r) => r.category).sort();
    expect(categories).toEqual([
      "events-reminders",
      "family-updates",
      "social-comments-on-own",
      "social-feed",
    ]);
  });

  it("getByUser returns preferences across all families", async () => {
    const results = await repo.getByUser(userId);
    expect(results.length).toBe(5);
  });

  it("getByUserAndFamily only returns matching family", async () => {
    const results1 = await repo.getByUserAndFamily(userId, familyId1);
    expect(results1.length).toBe(1);

    const results2 = await repo.getByUserAndFamily(userId, familyId2);
    expect(results2.length).toBe(4);
  });

  it("returns empty array for user with no preferences", async () => {
    const results = await repo.getByUser("non-existent");
    expect(results).toEqual([]);
  });

  it("returns empty array for non-existent family", async () => {
    const results = await repo.getByUserAndFamily(userId, "non-existent");
    expect(results).toEqual([]);
  });
});
