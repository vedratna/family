import { describe, it, expect, vi, beforeEach } from "vitest";

import type { IMembershipRepository } from "../../../repositories/interfaces/membership-repo";
import type {
  INotificationPreferenceRepository,
  IDeviceTokenRepository,
} from "../../../repositories/interfaces/notification-repo";
import { ProcessEventReminder } from "../process-event-reminder";
import type { IPushNotificationSender } from "../send-push-notification";

function mockMembershipRepo(): IMembershipRepository {
  return {
    create: vi.fn(),
    getByFamilyId: vi.fn(),
    getByUserId: vi.fn(),
    getByFamilyAndPerson: vi.fn(),
    updateRole: vi.fn(),
    delete: vi.fn(),
    countActiveMembers: vi.fn(),
  };
}

function mockPrefRepo(): INotificationPreferenceRepository {
  return {
    getByUser: vi.fn(),
    getByUserAndFamily: vi.fn(),
    upsert: vi.fn(),
    setDefaults: vi.fn(),
  };
}

function mockDeviceTokenRepo(): IDeviceTokenRepository {
  return {
    register: vi.fn(),
    getByUser: vi.fn(),
    delete: vi.fn(),
  };
}

function mockSender(): IPushNotificationSender {
  return { send: vi.fn() };
}

describe("ProcessEventReminder", () => {
  let memberRepo: IMembershipRepository;
  let prefRepo: INotificationPreferenceRepository;
  let tokenRepo: IDeviceTokenRepository;
  let sender: IPushNotificationSender;

  beforeEach(() => {
    memberRepo = mockMembershipRepo();
    prefRepo = mockPrefRepo();
    tokenRepo = mockDeviceTokenRepo();
    sender = mockSender();
  });

  it("sends notifications to all family members with devices", async () => {
    vi.mocked(memberRepo.getByFamilyId).mockResolvedValue([
      { familyId: "f1", personId: "p1", userId: "u1", role: "owner", joinedAt: "" },
      { familyId: "f1", personId: "p2", userId: "u2", role: "editor", joinedAt: "" },
    ]);
    // Prefs: both default-enabled for events-reminders
    vi.mocked(prefRepo.getByUserAndFamily).mockResolvedValue([]);
    vi.mocked(tokenRepo.getByUser).mockResolvedValue([
      { userId: "u1", deviceToken: "tok1", platform: "ios", createdAt: "" },
    ]);

    const uc = new ProcessEventReminder(memberRepo, prefRepo, tokenRepo, sender);
    const sent = await uc.execute({
      familyId: "f1",
      eventTitle: "Birthday",
      reminderType: "1-day",
    });

    // Both members attempted, but both have same 1 token pattern
    expect(sent).toBe(2);
    expect(sender.send).toHaveBeenCalledWith("tok1", "ios", "Birthday", "Birthday is tomorrow!");
  });

  it("uses day-of body text", async () => {
    vi.mocked(memberRepo.getByFamilyId).mockResolvedValue([
      { familyId: "f1", personId: "p1", userId: "u1", role: "owner", joinedAt: "" },
    ]);
    vi.mocked(prefRepo.getByUserAndFamily).mockResolvedValue([]);
    vi.mocked(tokenRepo.getByUser).mockResolvedValue([
      { userId: "u1", deviceToken: "tok1", platform: "android", createdAt: "" },
    ]);

    const uc = new ProcessEventReminder(memberRepo, prefRepo, tokenRepo, sender);
    await uc.execute({ familyId: "f1", eventTitle: "Picnic", reminderType: "day-of" });

    expect(sender.send).toHaveBeenCalledWith("tok1", "android", "Picnic", "Picnic is today!");
  });
});
