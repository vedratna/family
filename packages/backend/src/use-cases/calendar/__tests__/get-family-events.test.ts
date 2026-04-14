import type { FamilyEvent } from "@family-app/shared";
import { describe, it, expect, vi } from "vitest";

import type { IEventRepository } from "../../../repositories/interfaces/event-repo";
import { GetFamilyEvents } from "../get-family-events";

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

describe("GetFamilyEvents", () => {
  it("delegates to getByFamilyDateRange when no eventType", async () => {
    const repo = mockEventRepo();
    const events: FamilyEvent[] = [
      {
        id: "e1",
        familyId: "f1",
        title: "Birthday",
        startDate: "2025-06-01",
        eventType: "birthday",
        creatorPersonId: "p1",
        createdAt: "2025-01-01T00:00:00Z",
      },
    ];
    vi.mocked(repo.getByFamilyDateRange).mockResolvedValue(events);

    const uc = new GetFamilyEvents(repo);
    const result = await uc.execute({
      familyId: "f1",
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    });

    expect(result).toEqual(events);
    expect(repo.getByFamilyDateRange).toHaveBeenCalledWith("f1", "2025-01-01", "2025-12-31");
    expect(repo.getByFamilyAndType).not.toHaveBeenCalled();
  });

  it("delegates to getByFamilyAndType when eventType is provided", async () => {
    const repo = mockEventRepo();
    const events: FamilyEvent[] = [
      {
        id: "e2",
        familyId: "f1",
        title: "Bday",
        startDate: "2025-06-01",
        eventType: "birthday",
        creatorPersonId: "p1",
        createdAt: "2025-01-01T00:00:00Z",
      },
    ];
    vi.mocked(repo.getByFamilyAndType).mockResolvedValue(events);

    const uc = new GetFamilyEvents(repo);
    const result = await uc.execute({
      familyId: "f1",
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      eventType: "birthday",
    });

    expect(result).toEqual(events);
    expect(repo.getByFamilyAndType).toHaveBeenCalledWith("f1", "birthday");
    expect(repo.getByFamilyDateRange).not.toHaveBeenCalled();
  });
});
