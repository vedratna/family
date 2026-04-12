import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock repositories & use cases ---
const {
  mockGetByCognitoSub,
  mockGetByUserId,
  mockGetByFamilyAndPerson,
  mockEventRepoGetById,
  mockGetFamilyEventsExecute,
  mockCreateEventExecute,
  mockEditEventExecute,
  mockDeleteEventExecute,
  mockRSVPEventExecute,
} = vi.hoisted(() => ({
  mockGetByCognitoSub: vi.fn(),
  mockGetByUserId: vi.fn(),
  mockGetByFamilyAndPerson: vi.fn(),
  mockEventRepoGetById: vi.fn(),
  mockGetFamilyEventsExecute: vi.fn(),
  mockCreateEventExecute: vi.fn(),
  mockEditEventExecute: vi.fn(),
  mockDeleteEventExecute: vi.fn(),
  mockRSVPEventExecute: vi.fn(),
}));

vi.mock("../../../repositories/dynamodb/user-repo", () => ({
  DynamoUserRepository: vi.fn().mockImplementation(() => ({
    getByCognitoSub: mockGetByCognitoSub,
  })),
}));

vi.mock("../../../repositories/dynamodb/person-repo", () => ({
  DynamoPersonRepository: vi.fn().mockImplementation(() => ({
    getByUserId: mockGetByUserId,
  })),
}));

vi.mock("../../../repositories/dynamodb/membership-repo", () => ({
  DynamoMembershipRepository: vi.fn().mockImplementation(() => ({
    getByFamilyAndPerson: mockGetByFamilyAndPerson,
  })),
}));

vi.mock("../../../repositories/dynamodb/event-repo", () => ({
  DynamoEventRepository: vi.fn().mockImplementation(() => ({
    getById: mockEventRepoGetById,
  })),
}));

vi.mock("../../../repositories/dynamodb/event-rsvp-repo", () => ({
  DynamoEventRSVPRepository: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("../../../use-cases/calendar", () => ({
  GetFamilyEvents: vi.fn().mockImplementation(() => ({
    execute: mockGetFamilyEventsExecute,
  })),
  CreateEvent: vi.fn().mockImplementation(() => ({
    execute: mockCreateEventExecute,
  })),
  EditEvent: vi.fn().mockImplementation(() => ({
    execute: mockEditEventExecute,
  })),
  DeleteEvent: vi.fn().mockImplementation(() => ({
    execute: mockDeleteEventExecute,
  })),
  RSVPEvent: vi.fn().mockImplementation(() => ({
    execute: mockRSVPEventExecute,
  })),
}));

vi.mock("../../../domain/errors", () => {
  class DomainError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
      this.statusCode = 400;
      this.name = "DomainError";
    }
  }
  return { DomainError };
});

import { DomainError } from "../../../domain/errors";
import { handler } from "../handler";

function createEvent(fieldName: string, args: Record<string, unknown> = {}, sub = "test-sub") {
  return {
    info: { fieldName },
    arguments: args,
    identity: { sub },
  } as unknown;
}

function mockResolveRequester(personId = "p1", role = "admin" as const) {
  mockGetByCognitoSub.mockResolvedValue({ id: "u1" });
  mockGetByUserId.mockResolvedValue({ id: personId });
  mockGetByFamilyAndPerson.mockResolvedValue({ role });
}

describe("calendar handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- familyEvents ---
  describe("familyEvents", () => {
    it("returns events with required args only", async () => {
      const events = [{ id: "e1" }];
      mockGetFamilyEventsExecute.mockResolvedValue(events);

      const result = await handler(
        createEvent("familyEvents", {
          familyId: "f1",
          startDate: "2024-01-01",
          endDate: "2024-01-31",
        }) as any,
      );

      expect(mockGetFamilyEventsExecute).toHaveBeenCalledWith({
        familyId: "f1",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });
      expect(result).toEqual(events);
    });

    it("passes eventType when provided as string", async () => {
      mockGetFamilyEventsExecute.mockResolvedValue([]);

      await handler(
        createEvent("familyEvents", {
          familyId: "f1",
          startDate: "2024-01-01",
          endDate: "2024-01-31",
          eventType: "birthday",
        }) as any,
      );

      expect(mockGetFamilyEventsExecute).toHaveBeenCalledWith({
        familyId: "f1",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
        eventType: "birthday",
      });
    });

    it("does not pass eventType when not a string", async () => {
      mockGetFamilyEventsExecute.mockResolvedValue([]);

      await handler(
        createEvent("familyEvents", {
          familyId: "f1",
          startDate: "2024-01-01",
          endDate: "2024-01-31",
          eventType: 123,
        }) as any,
      );

      expect(mockGetFamilyEventsExecute).toHaveBeenCalledWith({
        familyId: "f1",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });
    });
  });

  // --- eventDetail ---
  describe("eventDetail", () => {
    it("returns event from repo", async () => {
      const event = { id: "e1", title: "Birthday" };
      mockEventRepoGetById.mockResolvedValue(event);

      const result = await handler(
        createEvent("eventDetail", {
          familyId: "f1",
          date: "2024-01-15",
          eventId: "e1",
        }) as any,
      );

      expect(mockEventRepoGetById).toHaveBeenCalledWith("f1", "2024-01-15", "e1");
      expect(result).toEqual(event);
    });
  });

  // --- createEvent ---
  describe("createEvent", () => {
    it("creates event with required fields", async () => {
      mockResolveRequester("p1", "admin" as any);
      const created = { id: "e1" };
      mockCreateEventExecute.mockResolvedValue(created);

      const result = await handler(
        createEvent("createEvent", {
          familyId: "f1",
          title: "Party",
          eventType: "celebration",
          startDate: "2024-06-15",
        }) as any,
      );

      expect(mockCreateEventExecute).toHaveBeenCalledWith({
        familyId: "f1",
        creatorPersonId: "p1",
        title: "Party",
        eventType: "celebration",
        startDate: "2024-06-15",
        requesterRole: "admin",
      });
      expect(result).toEqual(created);
    });

    it("passes optional fields when provided as strings", async () => {
      mockResolveRequester("p1", "admin" as any);
      mockCreateEventExecute.mockResolvedValue({ id: "e1" });

      await handler(
        createEvent("createEvent", {
          familyId: "f1",
          title: "Party",
          eventType: "celebration",
          startDate: "2024-06-15",
          description: "Fun party",
          startTime: "18:00",
          location: "Home",
          recurrenceRule: "FREQ=YEARLY",
        }) as any,
      );

      expect(mockCreateEventExecute).toHaveBeenCalledWith({
        familyId: "f1",
        creatorPersonId: "p1",
        title: "Party",
        eventType: "celebration",
        startDate: "2024-06-15",
        requesterRole: "admin",
        description: "Fun party",
        startTime: "18:00",
        location: "Home",
        recurrenceRule: "FREQ=YEARLY",
      });
    });

    it("does not pass optional fields when wrong types", async () => {
      mockResolveRequester("p1", "admin" as any);
      mockCreateEventExecute.mockResolvedValue({ id: "e1" });

      await handler(
        createEvent("createEvent", {
          familyId: "f1",
          title: "Party",
          eventType: "celebration",
          startDate: "2024-06-15",
          description: 123,
          startTime: true,
          location: null,
          recurrenceRule: 0,
        }) as any,
      );

      expect(mockCreateEventExecute).toHaveBeenCalledWith({
        familyId: "f1",
        creatorPersonId: "p1",
        title: "Party",
        eventType: "celebration",
        startDate: "2024-06-15",
        requesterRole: "admin",
      });
    });
  });

  // --- editEvent ---
  describe("editEvent", () => {
    it("edits event and returns true", async () => {
      mockResolveRequester("p1", "admin" as any);
      mockEditEventExecute.mockResolvedValue(undefined);

      const updates = { title: "Updated Party" };
      const result = await handler(
        createEvent("editEvent", {
          familyId: "f1",
          eventId: "e1",
          date: "2024-06-15",
          updates,
        }) as any,
      );

      expect(mockEditEventExecute).toHaveBeenCalledWith({
        familyId: "f1",
        eventId: "e1",
        date: "2024-06-15",
        updates,
        requesterRole: "admin",
      });
      expect(result).toBe(true);
    });
  });

  // --- deleteEvent ---
  describe("deleteEvent", () => {
    it("deletes event and returns true", async () => {
      mockResolveRequester("p1", "admin" as any);
      mockDeleteEventExecute.mockResolvedValue(undefined);

      const result = await handler(
        createEvent("deleteEvent", {
          familyId: "f1",
          date: "2024-06-15",
          eventId: "e1",
        }) as any,
      );

      expect(mockDeleteEventExecute).toHaveBeenCalledWith("f1", "2024-06-15", "e1", "admin");
      expect(result).toBe(true);
    });
  });

  // --- rsvpEvent ---
  describe("rsvpEvent", () => {
    it("rsvps to event with resolved personId", async () => {
      mockResolveRequester("p1");
      const rsvp = { id: "rsvp-1" };
      mockRSVPEventExecute.mockResolvedValue(rsvp);

      const result = await handler(
        createEvent("rsvpEvent", {
          familyId: "f1",
          eventId: "e1",
          status: "going",
        }) as any,
      );

      expect(mockRSVPEventExecute).toHaveBeenCalledWith({
        eventId: "e1",
        personId: "p1",
        status: "going",
      });
      expect(result).toEqual(rsvp);
    });
  });

  // --- resolveRequester error paths ---
  describe("resolveRequester", () => {
    it("throws when user not found", async () => {
      mockGetByCognitoSub.mockResolvedValue(undefined);

      await expect(
        handler(
          createEvent("createEvent", {
            familyId: "f1",
            title: "X",
            eventType: "t",
            startDate: "d",
          }) as any,
        ),
      ).rejects.toThrow("USER_NOT_FOUND");
    });

    it("throws when person not found", async () => {
      mockGetByCognitoSub.mockResolvedValue({ id: "u1" });
      mockGetByUserId.mockResolvedValue(undefined);

      await expect(
        handler(
          createEvent("createEvent", {
            familyId: "f1",
            title: "X",
            eventType: "t",
            startDate: "d",
          }) as any,
        ),
      ).rejects.toThrow("MEMBER_NOT_FOUND: Caller is not a member");
    });

    it("throws when membership not found", async () => {
      mockGetByCognitoSub.mockResolvedValue({ id: "u1" });
      mockGetByUserId.mockResolvedValue({ id: "p1" });
      mockGetByFamilyAndPerson.mockResolvedValue(undefined);

      await expect(
        handler(
          createEvent("createEvent", {
            familyId: "f1",
            title: "X",
            eventType: "t",
            startDate: "d",
          }) as any,
        ),
      ).rejects.toThrow("MEMBER_NOT_FOUND: No membership found");
    });

    it("uses empty string when identity is undefined", async () => {
      mockGetByCognitoSub.mockResolvedValue(undefined);

      const event = {
        info: { fieldName: "rsvpEvent" },
        arguments: { familyId: "f1", eventId: "e1", status: "going" },
        identity: undefined,
      } as unknown;

      await expect(handler(event as any)).rejects.toThrow("USER_NOT_FOUND");
      expect(mockGetByCognitoSub).toHaveBeenCalledWith("");
    });
  });

  // --- unknown field ---
  it("throws on unknown fieldName", async () => {
    await expect(handler(createEvent("unknownField") as any)).rejects.toThrow(
      "Unknown field: unknownField",
    );
  });

  // --- DomainError ---
  it("wraps DomainError with code prefix", async () => {
    mockResolveRequester();
    const domainErr = new (DomainError as any)("overlap", "CALENDAR_CONFLICT");
    mockCreateEventExecute.mockRejectedValue(domainErr);

    await expect(
      handler(
        createEvent("createEvent", {
          familyId: "f1",
          title: "X",
          eventType: "t",
          startDate: "d",
        }) as any,
      ),
    ).rejects.toThrow("CALENDAR_CONFLICT: overlap");
  });

  it("re-throws non-DomainError errors as-is", async () => {
    mockResolveRequester();
    mockCreateEventExecute.mockRejectedValue(new Error("boom"));

    await expect(
      handler(
        createEvent("createEvent", {
          familyId: "f1",
          title: "X",
          eventType: "t",
          startDate: "d",
        }) as any,
      ),
    ).rejects.toThrow("boom");
  });
});
