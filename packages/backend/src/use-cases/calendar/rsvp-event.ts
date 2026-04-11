import type { EventRSVP, RSVPStatus } from "@family-app/shared";

import type { IEventRSVPRepository } from "../../repositories/interfaces/event-repo";

interface RSVPEventInput {
  eventId: string;
  personId: string;
  status: RSVPStatus;
}

export class RSVPEvent {
  constructor(private readonly rsvpRepo: IEventRSVPRepository) {}

  async execute(input: RSVPEventInput): Promise<EventRSVP> {
    const rsvp: EventRSVP = {
      eventId: input.eventId,
      personId: input.personId,
      status: input.status,
      updatedAt: new Date().toISOString(),
    };

    await this.rsvpRepo.upsert(rsvp);

    return rsvp;
  }
}
