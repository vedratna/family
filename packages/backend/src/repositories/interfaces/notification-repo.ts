import type { NotificationPreference, DeviceToken } from "@family-app/shared";

export interface INotificationPreferenceRepository {
  getByUser(userId: string): Promise<NotificationPreference[]>;
  getByUserAndFamily(userId: string, familyId: string): Promise<NotificationPreference[]>;
  upsert(pref: NotificationPreference): Promise<void>;
  setDefaults(userId: string, familyId: string): Promise<void>;
}

export interface IDeviceTokenRepository {
  register(token: DeviceToken): Promise<void>;
  getByUser(userId: string): Promise<DeviceToken[]>;
  delete(userId: string, deviceToken: string): Promise<void>;
}
