import type { NotificationPreference } from "@family-app/shared";

export const MOCK_NOTIFICATION_PREFS: NotificationPreference[] = [
  { userId: "user-priya", familyId: "fam-sharma-001", category: "events-reminders", enabled: true },
  { userId: "user-priya", familyId: "fam-sharma-001", category: "social-comments-on-own", enabled: true },
  { userId: "user-priya", familyId: "fam-sharma-001", category: "social-feed", enabled: false },
  { userId: "user-priya", familyId: "fam-sharma-001", category: "family-updates", enabled: false },
];
