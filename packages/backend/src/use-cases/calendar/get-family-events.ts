import type { FamilyEvent } from "@family-app/shared";

import type { IEventRepository } from "../../repositories/interfaces/event-repo";

interface GetFamilyEventsInput {
  familyId: string;
  startDate: string;
  endDate: string;
  eventType?: string;
}

export class GetFamilyEvents {
  constructor(private readonly eventRepo: IEventRepository) {}

  async execute(input: GetFamilyEventsInput): Promise<FamilyEvent[]> {
    if (input.eventType !== undefined) {
      return this.eventRepo.getByFamilyAndType(input.familyId, input.eventType);
    }

    return this.eventRepo.getByFamilyDateRange(input.familyId, input.startDate, input.endDate);
  }
}
