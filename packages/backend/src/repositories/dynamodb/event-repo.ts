import type { FamilyEvent } from "@family-app/shared";

import type { IEventRepository } from "../interfaces/event-repo";

import { keys } from "./keys";
import { deleteItem, getItem, putItem, queryBetween, queryItems, updateItem } from "./operations";

export class DynamoEventRepository implements IEventRepository {
  async create(event: FamilyEvent): Promise<void> {
    await putItem({
      PK: keys.family.pk(event.familyId),
      SK: keys.family.sk.event(event.startDate, event.id),
      GSI2PK: keys.gsi2.eventType(event.familyId, event.eventType),
      GSI2SK: event.startDate,
      creatorPersonId: event.creatorPersonId,
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      startDate: event.startDate,
      startTime: event.startTime,
      location: event.location,
      recurrenceRule: event.recurrenceRule,
      createdAt: event.createdAt,
      entityType: "Event",
    });
  }

  async getById(familyId: string, date: string, eventId: string): Promise<FamilyEvent | undefined> {
    const item = await getItem(keys.family.pk(familyId), keys.family.sk.event(date, eventId));
    if (item === undefined) {
      return undefined;
    }
    return this.toEvent(eventId, familyId, item);
  }

  async getByFamilyDateRange(
    familyId: string,
    startDate: string,
    endDate: string,
  ): Promise<FamilyEvent[]> {
    const result = await queryBetween(
      keys.family.pk(familyId),
      `EVENT#${startDate}`,
      `EVENT#${endDate}\uffff`,
    );

    return result.items.map((item) => {
      const eventId = this.extractEventIdFromSK(item["SK"]);
      return this.toEvent(eventId, familyId, item);
    });
  }

  async getByFamilyAndType(familyId: string, eventType: string): Promise<FamilyEvent[]> {
    const result = await queryItems("GSI2PK", keys.gsi2.eventType(familyId, eventType), undefined, {
      indexName: "GSI2",
    });

    return result.items.map((item) => {
      const eventId = this.extractEventIdFromSK(item["SK"]);
      const itemFamilyId = item["PK"].replace("FAMILY#", "");
      return this.toEvent(eventId, itemFamilyId, item);
    });
  }

  async update(
    familyId: string,
    date: string,
    eventId: string,
    updates: Partial<FamilyEvent>,
  ): Promise<void> {
    const { id: _id, familyId: _familyId, ...rest } = updates;
    const updateFields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      updateFields[key] = value;
    }
    await updateItem(keys.family.pk(familyId), keys.family.sk.event(date, eventId), updateFields);
  }

  async delete(familyId: string, date: string, eventId: string): Promise<void> {
    await deleteItem(keys.family.pk(familyId), keys.family.sk.event(date, eventId));
  }

  private toEvent(eventId: string, familyId: string, item: Record<string, unknown>): FamilyEvent {
    const event: FamilyEvent = {
      id: eventId,
      familyId,
      creatorPersonId: item["creatorPersonId"] as string,
      title: item["title"] as string,
      eventType: item["eventType"] as FamilyEvent["eventType"],
      startDate: item["startDate"] as string,
      createdAt: item["createdAt"] as string,
    };
    if (typeof item["description"] === "string") {
      event.description = item["description"];
    }
    if (typeof item["startTime"] === "string") {
      event.startTime = item["startTime"];
    }
    if (typeof item["location"] === "string") {
      event.location = item["location"];
    }
    if (typeof item["recurrenceRule"] === "string") {
      event.recurrenceRule = item["recurrenceRule"];
    }
    return event;
  }

  private extractEventIdFromSK(sk: string): string {
    // SK format: EVENT#<date>#<eventId>
    const parts = sk.split("#");
    return parts[2] as string;
  }
}
