import type { FamilyEvent, EventRSVP } from "@family-app/shared";

export const MOCK_EVENTS: FamilyEvent[] = [
  {
    id: "evt-001",
    familyId: "fam-sharma-001",
    creatorPersonId: "person-priya",
    title: "Grandma's 75th Birthday",
    eventType: "birthday",
    startDate: "2026-04-12",
    startTime: "18:00",
    location: "Grandma's House",
    description: "Big celebration! Everyone please bring a dish.",
    recurrenceRule: "ANNUALLY",
    createdAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "evt-002",
    familyId: "fam-sharma-001",
    creatorPersonId: "person-rajesh",
    title: "Rajesh & Priya Anniversary",
    eventType: "anniversary",
    startDate: "2026-03-20",
    startTime: "19:00",
    location: "The Grand Restaurant",
    recurrenceRule: "ANNUALLY",
    createdAt: "2026-03-01T12:00:00Z",
  },
  {
    id: "evt-003",
    familyId: "fam-sharma-001",
    creatorPersonId: "person-priya",
    title: "Amit's Math Exam",
    eventType: "exam",
    startDate: "2026-04-20",
    startTime: "09:00",
    description: "Final exam. No distractions day before!",
    createdAt: "2026-04-01T10:00:00Z",
  },
];

export const MOCK_RSVPS: EventRSVP[] = [
  {
    eventId: "evt-001",
    personId: "person-priya",
    status: "going",
    updatedAt: "2026-03-10T10:01:00Z",
  },
  {
    eventId: "evt-001",
    personId: "person-rajesh",
    status: "going",
    updatedAt: "2026-03-10T12:00:00Z",
  },
  {
    eventId: "evt-001",
    personId: "person-amit",
    status: "going",
    updatedAt: "2026-03-11T10:00:00Z",
  },
  {
    eventId: "evt-001",
    personId: "person-sunita",
    status: "maybe",
    updatedAt: "2026-03-12T10:00:00Z",
  },
  {
    eventId: "evt-002",
    personId: "person-grandma",
    status: "going",
    updatedAt: "2026-03-02T10:00:00Z",
  },
];
