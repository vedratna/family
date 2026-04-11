export const NOTIFICATION_CATEGORIES = [
  "events-reminders",
  "social-feed",
  "social-comments-on-own",
  "family-updates",
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export interface NotificationPreference {
  userId: string;
  familyId: string;
  category: NotificationCategory;
  enabled: boolean;
}

export interface DeviceToken {
  userId: string;
  deviceToken: string;
  platform: "ios" | "android";
  createdAt: string;
}
