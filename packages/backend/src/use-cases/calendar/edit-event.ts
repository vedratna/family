import type { FamilyEvent, Role } from "@family-app/shared";

import { NotFoundError } from "../../domain/errors";
import type { IEventRepository } from "../../repositories/interfaces/event-repo";
import { requireRole } from "../../shared/permission-check";

interface EditEventInput {
  familyId: string;
  eventId: string;
  date: string;
  updates: Partial<
    Pick<
      FamilyEvent,
      "title" | "description" | "eventType" | "startDate" | "startTime" | "location"
    >
  >;
  requesterRole: Role;
}

export class EditEvent {
  constructor(private readonly eventRepo: IEventRepository) {}

  async execute(input: EditEventInput): Promise<void> {
    requireRole(input.requesterRole, "editor", "edit events");

    const existing = await this.eventRepo.getById(input.familyId, input.date, input.eventId);
    if (existing === undefined) {
      throw new NotFoundError("Event", input.eventId);
    }

    await this.eventRepo.update(input.familyId, input.date, input.eventId, input.updates);
  }
}

export class DeleteEvent {
  constructor(private readonly eventRepo: IEventRepository) {}

  async execute(
    familyId: string,
    date: string,
    eventId: string,
    requesterRole: Role,
  ): Promise<void> {
    requireRole(requesterRole, "editor", "delete events");

    const existing = await this.eventRepo.getById(familyId, date, eventId);
    if (existing === undefined) {
      throw new NotFoundError("Event", eventId);
    }

    await this.eventRepo.delete(familyId, date, eventId);
    // TODO: Cancel associated EventBridge reminders
  }
}
