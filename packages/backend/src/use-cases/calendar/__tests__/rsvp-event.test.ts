import { describe, it, expect, vi } from "vitest";

import type { IEventRSVPRepository } from "../../../repositories/interfaces/event-repo";
import { RSVPEvent } from "../rsvp-event";

function mockRSVPRepo(): IEventRSVPRepository {
  return {
    upsert: vi.fn(),
    getByEvent: vi.fn(),
    getByEventAndPerson: vi.fn(),
  };
}

describe("RSVPEvent", () => {
  it("creates an RSVP and returns it", async () => {
    const repo = mockRSVPRepo();
    const uc = new RSVPEvent(repo);

    const result = await uc.execute({
      eventId: "e1",
      personId: "p1",
      status: "going",
    });

    expect(result.eventId).toBe("e1");
    expect(result.personId).toBe("p1");
    expect(result.status).toBe("going");
    expect(result.updatedAt).toBeDefined();
    expect(repo.upsert).toHaveBeenCalledWith(result);
  });
});
