import type { FamilyEvent, EventType, Role } from "@family-app/shared";

import type { IEventRepository } from "../../repositories/interfaces/event-repo";
import { requireRole } from "../../shared/permission-check";

interface CreateEventInput {
  familyId: string;
  creatorPersonId: string;
  title: string;
  description?: string;
  eventType: EventType;
  startDate: string;
  startTime?: string;
  location?: string;
  recurrenceRule?: string;
  requesterRole: Role;
}

export class CreateEvent {
  constructor(private readonly eventRepo: IEventRepository) {}

  async execute(input: CreateEventInput): Promise<FamilyEvent> {
    requireRole(input.requesterRole, "editor", "create events");

    const event: FamilyEvent = {
      id: crypto.randomUUID(),
      familyId: input.familyId,
      creatorPersonId: input.creatorPersonId,
      title: input.title,
      eventType: input.eventType,
      startDate: input.startDate,
      createdAt: new Date().toISOString(),
    };

    if (input.description !== undefined) {
      event.description = input.description;
    }
    if (input.startTime !== undefined) {
      event.startTime = input.startTime;
    }
    if (input.location !== undefined) {
      event.location = input.location;
    }
    if (input.recurrenceRule !== undefined) {
      event.recurrenceRule = input.recurrenceRule;
    }

    await this.eventRepo.create(event);

    return event;
  }
}
