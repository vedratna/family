import { describe, it, expect, vi } from "vitest";

import type { IDeviceTokenRepository } from "../../../repositories/interfaces/notification-repo";
import { RegisterDeviceToken } from "../register-device-token";

function mockDeviceTokenRepo(): IDeviceTokenRepository {
  return {
    register: vi.fn(),
    getByUser: vi.fn(),
    delete: vi.fn(),
  };
}

describe("RegisterDeviceToken", () => {
  it("registers a device token", async () => {
    const repo = mockDeviceTokenRepo();
    const uc = new RegisterDeviceToken(repo);

    await uc.execute({ userId: "u1", deviceToken: "tok123", platform: "ios" });

    expect(repo.register).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        deviceToken: "tok123",
        platform: "ios",
      }),
    );
  });
});
