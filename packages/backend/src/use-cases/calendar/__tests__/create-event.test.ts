import { describe, it, expect, vi } from "vitest";

import { PermissionDeniedError } from "../../../domain/errors";
import type { IEventRepository } from "../../../repositories/interfaces/event-repo";
import { CreateEvent } from "../create-event";

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

describe("CreateEvent", () => {
  it("creates an event with required fields", async () => {
    const repo = mockEventRepo();
    const useCase = new CreateEvent(repo);

    const event = await useCase.execute({
      familyId: "fam-1",
      creatorPersonId: "person-1",
      title: "Grandma's 75th Birthday",
      eventType: "birthday",
      startDate: "2026-04-12",
      requesterRole: "editor",
    });

    expect(event.title).toBe("Grandma's 75th Birthday");
    expect(event.eventType).toBe("birthday");
    expect(event.startDate).toBe("2026-04-12");
    expect(repo.create).toHaveBeenCalledOnce();
  });

  it("creates an event with all optional fields", async () => {
    const repo = mockEventRepo();
    const useCase = new CreateEvent(repo);

    const event = await useCase.execute({
      familyId: "fam-1",
      creatorPersonId: "person-1",
      title: "Family Reunion",
      description: "Annual gathering at the farmhouse",
      eventType: "social-function",
      startDate: "2026-05-20",
      startTime: "18:00",
      location: "Grandma's House",
      recurrenceRule: "ANNUALLY",
      requesterRole: "admin",
    });

    expect(event.description).toBe("Annual gathering at the farmhouse");
    expect(event.startTime).toBe("18:00");
    expect(event.location).toBe("Grandma's House");
    expect(event.recurrenceRule).toBe("ANNUALLY");
  });

  it("rejects when viewer tries to create event", async () => {
    const repo = mockEventRepo();
    const useCase = new CreateEvent(repo);

    await expect(
      useCase.execute({
        familyId: "fam-1",
        creatorPersonId: "person-1",
        title: "Test",
        eventType: "custom",
        startDate: "2026-04-12",
        requesterRole: "viewer",
      }),
    ).rejects.toThrow(PermissionDeniedError);
  });
});
