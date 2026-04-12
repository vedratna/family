import type { DeviceToken } from "@family-app/shared";

import type { IDeviceTokenRepository } from "../interfaces/notification-repo";

import { keys } from "./keys";
import { deleteItem, putItem, queryItems } from "./operations";

export class DynamoDeviceTokenRepository implements IDeviceTokenRepository {
  async register(token: DeviceToken): Promise<void> {
    await putItem({
      PK: keys.user.pk(token.userId),
      SK: keys.user.sk.device(token.deviceToken),
      userId: token.userId,
      deviceToken: token.deviceToken,
      platform: token.platform,
      createdAt: token.createdAt,
      entityType: "DeviceToken",
    });
  }

  async getByUser(userId: string): Promise<DeviceToken[]> {
    const result = await queryItems("PK", keys.user.pk(userId), keys.prefix.device);
    return result.items.map((item) => this.toEntity(item));
  }

  async delete(userId: string, deviceToken: string): Promise<void> {
    await deleteItem(keys.user.pk(userId), keys.user.sk.device(deviceToken));
  }

  private toEntity(item: Record<string, unknown>): DeviceToken {
    return {
      userId: item["userId"] as string,
      deviceToken: item["deviceToken"] as string,
      platform: item["platform"] as DeviceToken["platform"],
      createdAt: item["createdAt"] as string,
    };
  }
}
