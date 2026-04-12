import type { FamilyEvent } from "@family-app/shared";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

import { DynamoEventRepository } from "../event-repo";

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

describe("DynamoEventRepository", () => {
  const repo = new DynamoEventRepository();

  const familyId = "family-1";

  const birthday: FamilyEvent = {
    id: "event-1",
    familyId,
    creatorPersonId: "person-1",
    title: "Mom's Birthday",
    description: "Surprise party",
    eventType: "birthday",
    startDate: "2026-03-15",
    startTime: "18:00",
    location: "Home",
    createdAt: "2026-01-01T10:00:00.000Z",
  };

  const holiday: FamilyEvent = {
    id: "event-2",
    familyId,
    creatorPersonId: "person-2",
    title: "Easter",
    eventType: "holiday",
    startDate: "2026-04-05",
    createdAt: "2026-01-01T11:00:00.000Z",
  };

  const anniversary: FamilyEvent = {
    id: "event-3",
    familyId,
    creatorPersonId: "person-1",
    title: "Wedding Anniversary",
    eventType: "anniversary",
    startDate: "2026-06-20",
    recurrenceRule: "FREQ=YEARLY",
    createdAt: "2026-01-01T12:00:00.000Z",
  };

  const anotherBirthday: FamilyEvent = {
    id: "event-4",
    familyId,
    creatorPersonId: "person-1",
    title: "Dad's Birthday",
    eventType: "birthday",
    startDate: "2026-07-10",
    createdAt: "2026-01-01T13:00:00.000Z",
  };

  it("creates and retrieves an event by id", async () => {
    await repo.create(birthday);
    const found = await repo.getById(familyId, birthday.startDate, "event-1");
    expect(found).toBeDefined();
    expect(found?.title).toBe("Mom's Birthday");
    expect(found?.description).toBe("Surprise party");
    expect(found?.eventType).toBe("birthday");
    expect(found?.startTime).toBe("18:00");
    expect(found?.location).toBe("Home");
  });

  it("returns undefined for non-existent event", async () => {
    const found = await repo.getById(familyId, "2026-01-01", "non-existent");
    expect(found).toBeUndefined();
  });

  it("handles optional fields correctly", async () => {
    await repo.create(holiday);
    const found = await repo.getById(familyId, holiday.startDate, "event-2");
    expect(found).toBeDefined();
    expect(found?.description).toBeUndefined();
    expect(found?.startTime).toBeUndefined();
    expect(found?.location).toBeUndefined();
    expect(found?.recurrenceRule).toBeUndefined();
  });

  it("queries events by date range", async () => {
    await repo.create(anniversary);
    await repo.create(anotherBirthday);

    const events = await repo.getByFamilyDateRange(familyId, "2026-03-01", "2026-05-01");
    expect(events).toHaveLength(2);
    expect(events[0]?.id).toBe("event-1");
    expect(events[1]?.id).toBe("event-2");
  });

  it("returns empty array for date range with no events", async () => {
    const events = await repo.getByFamilyDateRange(familyId, "2025-01-01", "2025-12-31");
    expect(events).toHaveLength(0);
  });

  it("queries events by family and type", async () => {
    const birthdays = await repo.getByFamilyAndType(familyId, "birthday");
    expect(birthdays).toHaveLength(2);
    const titles = birthdays.map((e) => e.title).sort();
    expect(titles).toEqual(["Dad's Birthday", "Mom's Birthday"]);
  });

  it("returns empty array for type with no events", async () => {
    const events = await repo.getByFamilyAndType(familyId, "exam");
    expect(events).toHaveLength(0);
  });

  it("updates an event", async () => {
    await repo.update(familyId, birthday.startDate, "event-1", {
      title: "Mom's 60th Birthday",
      location: "Restaurant",
    });

    const found = await repo.getById(familyId, birthday.startDate, "event-1");
    expect(found?.title).toBe("Mom's 60th Birthday");
    expect(found?.location).toBe("Restaurant");
    expect(found?.description).toBe("Surprise party");
  });

  it("deletes an event", async () => {
    await repo.delete(familyId, holiday.startDate, "event-2");
    const found = await repo.getById(familyId, holiday.startDate, "event-2");
    expect(found).toBeUndefined();
  });

  it("date range excludes deleted events", async () => {
    const events = await repo.getByFamilyDateRange(familyId, "2026-03-01", "2026-05-01");
    expect(events).toHaveLength(1);
    expect(events[0]?.id).toBe("event-1");
  });
});
