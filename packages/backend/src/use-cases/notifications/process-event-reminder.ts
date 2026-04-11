import type { IMembershipRepository } from "../../repositories/interfaces/membership-repo";
import type { INotificationPreferenceRepository } from "../../repositories/interfaces/notification-repo";
import type { IDeviceTokenRepository } from "../../repositories/interfaces/notification-repo";

import type { IPushNotificationSender } from "./send-push-notification";
import { SendPushNotification } from "./send-push-notification";

interface ProcessEventReminderInput {
  familyId: string;
  eventTitle: string;
  reminderType: "7-day" | "1-day" | "day-of";
}

export class ProcessEventReminder {
  constructor(
    private readonly membershipRepo: IMembershipRepository,
    private readonly prefRepo: INotificationPreferenceRepository,
    private readonly deviceTokenRepo: IDeviceTokenRepository,
    private readonly sender: IPushNotificationSender,
  ) {}

  async execute(input: ProcessEventReminderInput): Promise<number> {
    const memberships = await this.membershipRepo.getByFamilyId(input.familyId);

    const bodyMap: Record<string, string> = {
      "7-day": `${input.eventTitle} is in 1 week!`,
      "1-day": `${input.eventTitle} is tomorrow!`,
      "day-of": `${input.eventTitle} is today!`,
    };

    const sendNotif = new SendPushNotification(this.prefRepo, this.deviceTokenRepo, this.sender);

    let totalSent = 0;
    for (const membership of memberships) {
      const sent = await sendNotif.execute({
        userId: membership.userId,
        familyId: input.familyId,
        category: "events-reminders",
        title: input.eventTitle,
        body: bodyMap[input.reminderType] ?? `${input.eventTitle} reminder`,
      });
      totalSent += sent;
    }

    return totalSent;
  }
}
