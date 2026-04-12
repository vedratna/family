import type { EventRSVP } from "@family-app/shared";

import type { IEventRSVPRepository } from "../interfaces/event-repo";

import { keys } from "./keys";
import { getItem, putItem, queryItems } from "./operations";

export class DynamoEventRSVPRepository implements IEventRSVPRepository {
  async upsert(rsvp: EventRSVP): Promise<void> {
    await putItem({
      PK: keys.event.pk(rsvp.eventId),
      SK: keys.event.sk.rsvp(rsvp.personId),
      status: rsvp.status,
      updatedAt: rsvp.updatedAt,
      entityType: "EventRSVP",
    });
  }

  async getByEvent(eventId: string): Promise<EventRSVP[]> {
    const result = await queryItems("PK", keys.event.pk(eventId), keys.prefix.rsvp);

    return result.items.map((item) => {
      const sk = item["SK"];
      const personId = sk.replace("RSVP#", "");
      return this.toRSVP(eventId, personId, item);
    });
  }

  async getByEventAndPerson(eventId: string, personId: string): Promise<EventRSVP | undefined> {
    const item = await getItem(keys.event.pk(eventId), keys.event.sk.rsvp(personId));
    if (item === undefined) {
      return undefined;
    }
    return this.toRSVP(eventId, personId, item);
  }

  private toRSVP(eventId: string, personId: string, item: Record<string, unknown>): EventRSVP {
    return {
      eventId,
      personId,
      status: item["status"] as EventRSVP["status"],
      updatedAt: item["updatedAt"] as string,
    };
  }
}
