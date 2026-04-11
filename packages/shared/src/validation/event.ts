import { z } from "zod";

import { EVENT_TYPES } from "../types/event";

const RSVP_STATUSES = ["going", "maybe", "not-going"] as const;

export const CreateEventInput = z.object({
  familyId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  eventType: z.enum(EVENT_TYPES),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  location: z.string().max(500).optional(),
  recurrenceRule: z.string().max(200).optional(),
});

export const EditEventInput = z.object({
  eventId: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  eventType: z.enum(EVENT_TYPES).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  location: z.string().max(500).optional(),
});

export const RSVPInput = z.object({
  eventId: z.string().uuid(),
  status: z.enum(RSVP_STATUSES),
});

export type CreateEventInputType = z.infer<typeof CreateEventInput>;
export type EditEventInputType = z.infer<typeof EditEventInput>;
export type RSVPInputType = z.infer<typeof RSVPInput>;
