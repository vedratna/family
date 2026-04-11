import type { NotificationPreference, DeviceToken } from "@family-app/shared";
import { describe, it, expect, vi } from "vitest";

import type { IDeviceTokenRepository, INotificationPreferenceRepository } from "../../../repositories/interfaces/notification-repo";
import type { IPushNotificationSender } from "../send-push-notification";
import { SendPushNotification } from "../send-push-notification";

function mockPrefRepo(prefs: NotificationPreference[]): INotificationPreferenceRepository {
  return {
    getByUser: vi.fn(),
    getByUserAndFamily: vi.fn().mockResolvedValue(prefs),
    upsert: vi.fn(),
    setDefaults: vi.fn(),
  };
}

function mockDeviceTokenRepo(tokens: DeviceToken[]): IDeviceTokenRepository {
  return {
    register: vi.fn(),
    getByUser: vi.fn().mockResolvedValue(tokens),
    delete: vi.fn(),
  };
}

function mockSender(): IPushNotificationSender {
  return { send: vi.fn() };
}

describe("SendPushNotification", () => {
  it("sends notification to all devices when category is enabled", async () => {
    const prefRepo = mockPrefRepo([
      { userId: "u1", familyId: "f1", category: "events-reminders", enabled: true },
    ]);
    const tokenRepo = mockDeviceTokenRepo([
      { userId: "u1", deviceToken: "tok-1", platform: "ios", createdAt: "2026-01-01T00:00:00Z" },
      { userId: "u1", deviceToken: "tok-2", platform: "android", createdAt: "2026-01-01T00:00:00Z" },
    ]);
    const sender = mockSender();
    const useCase = new SendPushNotification(prefRepo, tokenRepo, sender);

    const count = await useCase.execute({
      userId: "u1",
      familyId: "f1",
      category: "events-reminders",
      title: "Birthday",
      body: "Grandma's birthday is tomorrow!",
    });

    expect(count).toBe(2);
    expect(sender.send).toHaveBeenCalledTimes(2);
    expect(sender.send).toHaveBeenCalledWith("tok-1", "ios", "Birthday", "Grandma's birthday is tomorrow!");
    expect(sender.send).toHaveBeenCalledWith("tok-2", "android", "Birthday", "Grandma's birthday is tomorrow!");
  });

  it("skips notification when category is disabled", async () => {
    const prefRepo = mockPrefRepo([
      { userId: "u1", familyId: "f1", category: "social-feed", enabled: false },
    ]);
    const tokenRepo = mockDeviceTokenRepo([
      { userId: "u1", deviceToken: "tok-1", platform: "ios", createdAt: "2026-01-01T00:00:00Z" },
    ]);
    const sender = mockSender();
    const useCase = new SendPushNotification(prefRepo, tokenRepo, sender);

    const count = await useCase.execute({
      userId: "u1",
      familyId: "f1",
      category: "social-feed",
      title: "New Post",
      body: "Someone posted!",
    });

    expect(count).toBe(0);
    expect(sender.send).not.toHaveBeenCalled();
  });

  it("uses default ON for events-reminders when no preference set", async () => {
    const prefRepo = mockPrefRepo([]); // no prefs set
    const tokenRepo = mockDeviceTokenRepo([
      { userId: "u1", deviceToken: "tok-1", platform: "ios", createdAt: "2026-01-01T00:00:00Z" },
    ]);
    const sender = mockSender();
    const useCase = new SendPushNotification(prefRepo, tokenRepo, sender);

    const count = await useCase.execute({
      userId: "u1",
      familyId: "f1",
      category: "events-reminders",
      title: "Event",
      body: "Reminder!",
    });

    expect(count).toBe(1);
    expect(sender.send).toHaveBeenCalledOnce();
  });

  it("uses default OFF for social-feed when no preference set", async () => {
    const prefRepo = mockPrefRepo([]); // no prefs set
    const tokenRepo = mockDeviceTokenRepo([
      { userId: "u1", deviceToken: "tok-1", platform: "ios", createdAt: "2026-01-01T00:00:00Z" },
    ]);
    const sender = mockSender();
    const useCase = new SendPushNotification(prefRepo, tokenRepo, sender);

    const count = await useCase.execute({
      userId: "u1",
      familyId: "f1",
      category: "social-feed",
      title: "New Post",
      body: "Someone posted!",
    });

    expect(count).toBe(0);
    expect(sender.send).not.toHaveBeenCalled();
  });

  it("uses default ON for comments-on-own when no preference set", async () => {
    const prefRepo = mockPrefRepo([]);
    const tokenRepo = mockDeviceTokenRepo([
      { userId: "u1", deviceToken: "tok-1", platform: "ios", createdAt: "2026-01-01T00:00:00Z" },
    ]);
    const sender = mockSender();
    const useCase = new SendPushNotification(prefRepo, tokenRepo, sender);

    const count = await useCase.execute({
      userId: "u1",
      familyId: "f1",
      category: "social-comments-on-own",
      title: "Comment",
      body: "Someone commented!",
    });

    expect(count).toBe(1);
  });
});
