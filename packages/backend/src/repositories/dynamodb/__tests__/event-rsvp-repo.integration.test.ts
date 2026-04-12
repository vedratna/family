import type { EventRSVP } from "@family-app/shared";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

import { DynamoEventRSVPRepository } from "../event-rsvp-repo";

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

describe("DynamoEventRSVPRepository", () => {
  const repo = new DynamoEventRSVPRepository();

  const eventId = "event-1";

  const rsvp1: EventRSVP = {
    eventId,
    personId: "person-1",
    status: "going",
    updatedAt: "2026-01-01T10:00:00.000Z",
  };

  const rsvp2: EventRSVP = {
    eventId,
    personId: "person-2",
    status: "maybe",
    updatedAt: "2026-01-01T10:01:00.000Z",
  };

  const rsvp3: EventRSVP = {
    eventId,
    personId: "person-3",
    status: "not-going",
    updatedAt: "2026-01-01T10:02:00.000Z",
  };

  it("upserts and retrieves RSVPs by event", async () => {
    await repo.upsert(rsvp1);
    await repo.upsert(rsvp2);
    await repo.upsert(rsvp3);

    const rsvps = await repo.getByEvent(eventId);
    expect(rsvps).toHaveLength(3);
  });

  it("retrieves RSVP by event and person", async () => {
    const found = await repo.getByEventAndPerson(eventId, "person-1");
    expect(found).toBeDefined();
    expect(found?.status).toBe("going");
    expect(found?.updatedAt).toBe("2026-01-01T10:00:00.000Z");
  });

  it("returns undefined for non-existent RSVP", async () => {
    const found = await repo.getByEventAndPerson(eventId, "non-existent");
    expect(found).toBeUndefined();
  });

  it("returns undefined for non-existent event", async () => {
    const found = await repo.getByEventAndPerson("non-existent-event", "person-1");
    expect(found).toBeUndefined();
  });

  it("returns empty array for event with no RSVPs", async () => {
    const rsvps = await repo.getByEvent("no-rsvps-event");
    expect(rsvps).toHaveLength(0);
  });

  it("upsert overwrites existing RSVP", async () => {
    const updatedRsvp: EventRSVP = {
      eventId,
      personId: "person-1",
      status: "not-going",
      updatedAt: "2026-01-02T10:00:00.000Z",
    };
    await repo.upsert(updatedRsvp);

    const found = await repo.getByEventAndPerson(eventId, "person-1");
    expect(found?.status).toBe("not-going");
    expect(found?.updatedAt).toBe("2026-01-02T10:00:00.000Z");

    const allRsvps = await repo.getByEvent(eventId);
    expect(allRsvps).toHaveLength(3);
  });

  it("preserves RSVP fields correctly", async () => {
    const rsvps = await repo.getByEvent(eventId);
    const found = rsvps.find((r) => r.personId === "person-2");
    expect(found).toBeDefined();
    expect(found?.eventId).toBe(eventId);
    expect(found?.personId).toBe("person-2");
    expect(found?.status).toBe("maybe");
    expect(found?.updatedAt).toBe("2026-01-01T10:01:00.000Z");
  });
});
