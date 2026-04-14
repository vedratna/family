import type { FamilyEvent } from "@family-app/shared";
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { IEventRepository } from "../../../repositories/interfaces/event-repo";
import { GenerateRecurringEvents } from "../recurring-events";

function mockEventRepo(): IEventRepository {
  return {
    create: vi.fn(),
    getById: vi.fn(),
    getByFamilyDateRange: vi.fn(),
    getByFamilyAndType: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

describe("GenerateRecurringEvents", () => {
  let repo: IEventRepository;
  let uc: GenerateRecurringEvents;

  beforeEach(() => {
    repo = mockEventRepo();
    uc = new GenerateRecurringEvents(repo);
  });

  it("creates next-year instances for annually recurring events", async () => {
    const existingEvent: FamilyEvent = {
      id: "e1",
      familyId: "f1",
      creatorPersonId: "p1",
      title: "Birthday",
      eventType: "birthday",
      startDate: "2025-06-15",
      recurrenceRule: "ANNUALLY",
      createdAt: "2025-01-01T00:00:00Z",
    };

    vi.mocked(repo.getByFamilyDateRange)
      .mockResolvedValueOnce([existingEvent])
      .mockResolvedValueOnce([]);

    const result = await uc.execute("f1", "2025-06-01");

    expect(result).toHaveLength(1);
    expect(result[0]!.startDate).toBe("2026-06-15");
    expect(result[0]!.title).toBe("Birthday");
    expect(result[0]!.recurrenceRule).toBe("ANNUALLY");
    expect(repo.create).toHaveBeenCalledOnce();
  });

  it("skips creation when next-year instance already exists", async () => {
    const existingEvent: FamilyEvent = {
      id: "e1",
      familyId: "f1",
      creatorPersonId: "p1",
      title: "Anniversary",
      eventType: "anniversary",
      startDate: "2025-03-10",
      recurrenceRule: "ANNUALLY",
      createdAt: "2025-01-01T00:00:00Z",
    };

    const nextYearDuplicate: FamilyEvent = {
      id: "e2",
      familyId: "f1",
      creatorPersonId: "p1",
      title: "Anniversary",
      eventType: "anniversary",
      startDate: "2026-03-10",
      createdAt: "2025-01-01T00:00:00Z",
    };

    vi.mocked(repo.getByFamilyDateRange)
      .mockResolvedValueOnce([existingEvent])
      .mockResolvedValueOnce([nextYearDuplicate]);

    const result = await uc.execute("f1", "2025-03-01");

    expect(result).toHaveLength(0);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("skips non-recurring events", async () => {
    const oneTimeEvent: FamilyEvent = {
      id: "e1",
      familyId: "f1",
      creatorPersonId: "p1",
      title: "Picnic",
      eventType: "custom",
      startDate: "2025-07-04",
      createdAt: "2025-01-01T00:00:00Z",
    };

    vi.mocked(repo.getByFamilyDateRange).mockResolvedValueOnce([oneTimeEvent]);

    const result = await uc.execute("f1", "2025-07-01");

    expect(result).toHaveLength(0);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("copies optional fields (description, startTime, location) to new event", async () => {
    const existingEvent: FamilyEvent = {
      id: "e1",
      familyId: "f1",
      creatorPersonId: "p1",
      title: "Reunion",
      eventType: "social-function",
      startDate: "2025-08-20",
      description: "Annual family reunion",
      startTime: "14:00",
      location: "Grandma's house",
      recurrenceRule: "ANNUALLY",
      createdAt: "2025-01-01T00:00:00Z",
    };

    vi.mocked(repo.getByFamilyDateRange)
      .mockResolvedValueOnce([existingEvent])
      .mockResolvedValueOnce([]);

    const result = await uc.execute("f1", "2025-08-01");

    expect(result).toHaveLength(1);
    expect(result[0]!.description).toBe("Annual family reunion");
    expect(result[0]!.startTime).toBe("14:00");
    expect(result[0]!.location).toBe("Grandma's house");
  });
});
