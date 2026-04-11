import type { NotificationCategory } from "@family-app/shared";

import type { IDeviceTokenRepository } from "../../repositories/interfaces/notification-repo";
import type { INotificationPreferenceRepository } from "../../repositories/interfaces/notification-repo";

interface PushNotificationInput {
  userId: string;
  familyId: string;
  category: NotificationCategory;
  title: string;
  body: string;
}

export interface IPushNotificationSender {
  send(
    deviceToken: string,
    platform: "ios" | "android",
    title: string,
    body: string,
  ): Promise<void>;
}

export class SendPushNotification {
  constructor(
    private readonly prefRepo: INotificationPreferenceRepository,
    private readonly deviceTokenRepo: IDeviceTokenRepository,
    private readonly sender: IPushNotificationSender,
  ) {}

  async execute(input: PushNotificationInput): Promise<number> {
    // Check if user has this category enabled
    const prefs = await this.prefRepo.getByUserAndFamily(input.userId, input.familyId);
    const categoryPref = prefs.find((p) => p.category === input.category);

    // If preference not set, check defaults (events-reminders and comments-on-own are ON)
    const defaultEnabled =
      input.category === "events-reminders" || input.category === "social-comments-on-own";
    const isEnabled = categoryPref !== undefined ? categoryPref.enabled : defaultEnabled;

    if (!isEnabled) {
      return 0;
    }

    // Get all device tokens for this user
    const tokens = await this.deviceTokenRepo.getByUser(input.userId);

    // Send to all devices
    let sentCount = 0;
    for (const token of tokens) {
      await this.sender.send(token.deviceToken, token.platform, input.title, input.body);
      sentCount++;
    }

    return sentCount;
  }
}
