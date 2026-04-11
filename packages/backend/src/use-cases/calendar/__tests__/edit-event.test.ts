import type { FamilyEvent } from "@family-app/shared";
import { describe, it, expect, vi } from "vitest";

import { NotFoundError, PermissionDeniedError } from "../../../domain/errors";
import type { IEventRepository } from "../../../repositories/interfaces/event-repo";
import { EditEvent, DeleteEvent } from "../edit-event";

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

const existingEvent: FamilyEvent = {
  id: "evt-1",
  familyId: "fam-1",
  creatorPersonId: "person-1",
  title: "Birthday",
  eventType: "birthday",
  startDate: "2026-04-12",
  createdAt: "2026-01-01T00:00:00Z",
};

describe("EditEvent", () => {
  it("updates event fields", async () => {
    const repo = mockEventRepo();
    vi.mocked(repo.getById).mockResolvedValue(existingEvent);
    const useCase = new EditEvent(repo);

    await useCase.execute({
      familyId: "fam-1",
      eventId: "evt-1",
      date: "2026-04-12",
      updates: { title: "Grandma's Birthday Party" },
      requesterRole: "editor",
    });

    expect(repo.update).toHaveBeenCalledWith("fam-1", "2026-04-12", "evt-1", {
      title: "Grandma's Birthday Party",
    });
  });

  it("throws NotFoundError for missing event", async () => {
    const repo = mockEventRepo();
    vi.mocked(repo.getById).mockResolvedValue(undefined);
    const useCase = new EditEvent(repo);

    await expect(
      useCase.execute({
        familyId: "fam-1",
        eventId: "missing",
        date: "2026-04-12",
        updates: { title: "X" },
        requesterRole: "admin",
      }),
    ).rejects.toThrow(NotFoundError);
  });
});

describe("DeleteEvent", () => {
  it("deletes an existing event", async () => {
    const repo = mockEventRepo();
    vi.mocked(repo.getById).mockResolvedValue(existingEvent);
    const useCase = new DeleteEvent(repo);

    await useCase.execute("fam-1", "2026-04-12", "evt-1", "admin");

    expect(repo.delete).toHaveBeenCalledWith("fam-1", "2026-04-12", "evt-1");
  });

  it("rejects viewer deleting events", async () => {
    const repo = mockEventRepo();
    const useCase = new DeleteEvent(repo);

    await expect(
      useCase.execute("fam-1", "2026-04-12", "evt-1", "viewer"),
    ).rejects.toThrow(PermissionDeniedError);
  });
});
