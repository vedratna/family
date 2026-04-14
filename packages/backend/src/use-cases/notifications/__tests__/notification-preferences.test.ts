import { describe, it, expect, vi } from "vitest";

import type { INotificationPreferenceRepository } from "../../../repositories/interfaces/notification-repo";
import {
  GetNotificationPreferences,
  UpdateNotificationPreference,
  SetDefaultPreferences,
} from "../notification-preferences";

function mockPrefRepo(): INotificationPreferenceRepository {
  return {
    getByUser: vi.fn(),
    getByUserAndFamily: vi.fn(),
    upsert: vi.fn(),
    setDefaults: vi.fn(),
  };
}

describe("GetNotificationPreferences", () => {
  it("delegates to prefRepo.getByUserAndFamily", async () => {
    const repo = mockPrefRepo();
    const prefs = [
      { userId: "u1", familyId: "f1", category: "events-reminders" as const, enabled: true },
    ];
    vi.mocked(repo.getByUserAndFamily).mockResolvedValue(prefs);

    const uc = new GetNotificationPreferences(repo);
    const result = await uc.execute("u1", "f1");

    expect(result).toEqual(prefs);
  });
});

describe("UpdateNotificationPreference", () => {
  it("upserts a preference", async () => {
    const repo = mockPrefRepo();
    const uc = new UpdateNotificationPreference(repo);

    await uc.execute({
      userId: "u1",
      familyId: "f1",
      category: "events-reminders",
      enabled: false,
    });

    expect(repo.upsert).toHaveBeenCalledWith({
      userId: "u1",
      familyId: "f1",
      category: "events-reminders",
      enabled: false,
    });
  });
});

describe("SetDefaultPreferences", () => {
  it("delegates to prefRepo.setDefaults", async () => {
    const repo = mockPrefRepo();
    const uc = new SetDefaultPreferences(repo);

    await uc.execute("u1", "f1");

    expect(repo.setDefaults).toHaveBeenCalledWith("u1", "f1");
  });
});
