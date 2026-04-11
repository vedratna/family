import type { DeviceToken } from "@family-app/shared";

import type { IDeviceTokenRepository } from "../../repositories/interfaces/notification-repo";

interface RegisterDeviceTokenInput {
  userId: string;
  deviceToken: string;
  platform: "ios" | "android";
}

export class RegisterDeviceToken {
  constructor(private readonly deviceTokenRepo: IDeviceTokenRepository) {}

  async execute(input: RegisterDeviceTokenInput): Promise<void> {
    const token: DeviceToken = {
      userId: input.userId,
      deviceToken: input.deviceToken,
      platform: input.platform,
      createdAt: new Date().toISOString(),
    };

    await this.deviceTokenRepo.register(token);
  }
}
