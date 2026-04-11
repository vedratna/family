import type { NotificationCategory, NotificationPreference } from "@family-app/shared";

import type { INotificationPreferenceRepository } from "../../repositories/interfaces/notification-repo";

export class GetNotificationPreferences {
  constructor(private readonly prefRepo: INotificationPreferenceRepository) {}

  async execute(userId: string, familyId: string): Promise<NotificationPreference[]> {
    return this.prefRepo.getByUserAndFamily(userId, familyId);
  }
}

interface UpdatePreferenceInput {
  userId: string;
  familyId: string;
  category: NotificationCategory;
  enabled: boolean;
}

export class UpdateNotificationPreference {
  constructor(private readonly prefRepo: INotificationPreferenceRepository) {}

  async execute(input: UpdatePreferenceInput): Promise<void> {
    await this.prefRepo.upsert({
      userId: input.userId,
      familyId: input.familyId,
      category: input.category,
      enabled: input.enabled,
    });
  }
}

/**
 * Sets default notification preferences when a member joins a family.
 * Defaults: events-reminders ON, social-comments-on-own ON, everything else OFF.
 */
export class SetDefaultPreferences {
  constructor(private readonly prefRepo: INotificationPreferenceRepository) {}

  async execute(userId: string, familyId: string): Promise<void> {
    await this.prefRepo.setDefaults(userId, familyId);
  }
}
