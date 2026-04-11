export const EVENT_TYPES = [
  "birthday",
  "marriage",
  "anniversary",
  "exam",
  "social-function",
  "holiday",
  "custom",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export type RSVPStatus = "going" | "maybe" | "not-going";

export interface FamilyEvent {
  id: string;
  familyId: string;
  creatorPersonId: string;
  title: string;
  description?: string;
  eventType: EventType;
  startDate: string;
  startTime?: string;
  location?: string;
  recurrenceRule?: string;
  createdAt: string;
}

export interface EventRSVP {
  eventId: string;
  personId: string;
  status: RSVPStatus;
  updatedAt: string;
}
