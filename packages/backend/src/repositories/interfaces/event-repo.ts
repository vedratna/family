import type { FamilyEvent, EventRSVP } from "@family-app/shared";

export interface IEventRepository {
  create(event: FamilyEvent): Promise<void>;
  getById(familyId: string, date: string, eventId: string): Promise<FamilyEvent | undefined>;
  getByFamilyDateRange(
    familyId: string,
    startDate: string,
    endDate: string,
  ): Promise<FamilyEvent[]>;
  getByFamilyAndType(familyId: string, eventType: string): Promise<FamilyEvent[]>;
  update(
    familyId: string,
    date: string,
    eventId: string,
    updates: Partial<FamilyEvent>,
  ): Promise<void>;
  delete(familyId: string, date: string, eventId: string): Promise<void>;
}

export interface IEventRSVPRepository {
  upsert(rsvp: EventRSVP): Promise<void>;
  getByEvent(eventId: string): Promise<EventRSVP[]>;
  getByEventAndPerson(eventId: string, personId: string): Promise<EventRSVP | undefined>;
}
