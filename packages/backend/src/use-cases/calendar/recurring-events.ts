import type { FamilyEvent } from "@family-app/shared";

import type { IEventRepository } from "../../repositories/interfaces/event-repo";

/**
 * Generates next-year instances for annually recurring events.
 * Called by a scheduled Lambda (e.g., daily) to create upcoming occurrences.
 */
export class GenerateRecurringEvents {
  constructor(private readonly eventRepo: IEventRepository) {}

  async execute(familyId: string, referenceDate: string): Promise<FamilyEvent[]> {
    // Get all events for the family in the current year
    const yearStart = referenceDate.substring(0, 4) + "-01-01";
    const yearEnd = referenceDate.substring(0, 4) + "-12-31";
    const events = await this.eventRepo.getByFamilyDateRange(familyId, yearStart, yearEnd);

    const recurringEvents = events.filter(
      (e) => e.recurrenceRule === "ANNUALLY",
    );

    const nextYear = String(Number(referenceDate.substring(0, 4)) + 1);
    const created: FamilyEvent[] = [];

    for (const event of recurringEvents) {
      const nextDate = nextYear + event.startDate.substring(4);

      // Check if next year's instance already exists
      const existingNextYear = await this.eventRepo.getByFamilyDateRange(
        familyId,
        nextDate,
        nextDate,
      );
      const alreadyExists = existingNextYear.some(
        (e) => e.title === event.title && e.eventType === event.eventType,
      );

      if (!alreadyExists) {
        const newEvent: FamilyEvent = {
          id: crypto.randomUUID(),
          familyId: event.familyId,
          creatorPersonId: event.creatorPersonId,
          title: event.title,
          eventType: event.eventType,
          startDate: nextDate,
          createdAt: new Date().toISOString(),
        };

        if (event.description !== undefined) {
          newEvent.description = event.description;
        }
        if (event.startTime !== undefined) {
          newEvent.startTime = event.startTime;
        }
        if (event.location !== undefined) {
          newEvent.location = event.location;
        }
        newEvent.recurrenceRule = "ANNUALLY";

        await this.eventRepo.create(newEvent);
        created.push(newEvent);
      }
    }

    return created;
  }
}
