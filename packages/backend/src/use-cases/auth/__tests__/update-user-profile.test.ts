import type { User } from "@family-app/shared";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { UserNotFoundError } from "../../../domain/errors";
import type { IUserRepository } from "../../../repositories/interfaces";
import { UpdateUserProfile } from "../update-user-profile";

function createMockUserRepo(): IUserRepository {
  return {
    create: vi.fn(),
    getById: vi.fn(),
    getByPhone: vi.fn(),
    getByCognitoSub: vi.fn(),
    updateProfile: vi.fn(),
  };
}

describe("UpdateUserProfile", () => {
  let userRepo: IUserRepository;
  let useCase: UpdateUserProfile;

  const existingUser: User = {
    id: "user-1",
    cognitoSub: "cognito-123",
    phone: "+919876543210",
    displayName: "Priya",
    createdAt: "2026-01-01T00:00:00Z",
  };

  beforeEach(() => {
    userRepo = createMockUserRepo();
    useCase = new UpdateUserProfile(userRepo);
  });

  it("updates display name", async () => {
    vi.mocked(userRepo.getById).mockResolvedValue(existingUser);
    vi.mocked(userRepo.updateProfile).mockResolvedValue(undefined);

    const result = await useCase.execute({
      userId: "user-1",
      profile: { displayName: "Priya Sharma" },
    });

    expect(result.user.displayName).toBe("Priya Sharma");
    expect(userRepo.updateProfile).toHaveBeenCalledWith("user-1", {
      displayName: "Priya Sharma",
    });
  });

  it("updates profile with photo and DOB", async () => {
    vi.mocked(userRepo.getById).mockResolvedValue(existingUser);
    vi.mocked(userRepo.updateProfile).mockResolvedValue(undefined);

    const result = await useCase.execute({
      userId: "user-1",
      profile: {
        displayName: "Priya",
        profilePhotoKey: "photos/priya.jpg",
        dateOfBirth: "1990-08-15",
      },
    });

    expect(result.user.profilePhotoKey).toBe("photos/priya.jpg");
    expect(result.user.dateOfBirth).toBe("1990-08-15");
  });

  it("throws UserNotFoundError when user does not exist", async () => {
    vi.mocked(userRepo.getById).mockResolvedValue(undefined);

    await expect(
      useCase.execute({
        userId: "nonexistent",
        profile: { displayName: "Priya" },
      }),
    ).rejects.toThrow(UserNotFoundError);

    expect(userRepo.updateProfile).not.toHaveBeenCalled();
  });
});
