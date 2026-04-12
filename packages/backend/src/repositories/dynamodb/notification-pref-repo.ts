import { NOTIFICATION_CATEGORIES } from "@family-app/shared";
import type { NotificationPreference } from "@family-app/shared";

import type { INotificationPreferenceRepository } from "../interfaces/notification-repo";

import { keys } from "./keys";
import { putItem, queryItems } from "./operations";

export class DynamoNotificationPrefRepository implements INotificationPreferenceRepository {
  async getByUser(userId: string): Promise<NotificationPreference[]> {
    const result = await queryItems("PK", keys.user.pk(userId), keys.prefix.notifPref);
    return result.items.map((item) => this.toEntity(item));
  }

  async getByUserAndFamily(userId: string, familyId: string): Promise<NotificationPreference[]> {
    const result = await queryItems("PK", keys.user.pk(userId), `NOTIFPREF#${familyId}`);
    return result.items.map((item) => this.toEntity(item));
  }

  async upsert(pref: NotificationPreference): Promise<void> {
    await putItem({
      PK: keys.user.pk(pref.userId),
      SK: keys.user.sk.notifPref(pref.familyId, pref.category),
      userId: pref.userId,
      familyId: pref.familyId,
      category: pref.category,
      enabled: pref.enabled,
      entityType: "NotificationPreference",
    });
  }

  async setDefaults(userId: string, familyId: string): Promise<void> {
    const promises = NOTIFICATION_CATEGORIES.map((category) =>
      this.upsert({
        userId,
        familyId,
        category,
        enabled: true,
      }),
    );
    await Promise.all(promises);
  }

  private toEntity(item: Record<string, unknown>): NotificationPreference {
    return {
      userId: item["userId"] as string,
      familyId: item["familyId"] as string,
      category: item["category"] as NotificationPreference["category"],
      enabled: item["enabled"] as boolean,
    };
  }
}
