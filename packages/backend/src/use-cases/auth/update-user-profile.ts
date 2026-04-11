import type { User, UserProfile } from "@family-app/shared";

import { UserNotFoundError } from "../../domain/errors";
import type { IUserRepository } from "../../repositories/interfaces";

interface UpdateProfileInput {
  userId: string;
  profile: UserProfile;
}

interface UpdateProfileResult {
  user: User;
}

export class UpdateUserProfile {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: UpdateProfileInput): Promise<UpdateProfileResult> {
    const existing = await this.userRepo.getById(input.userId);
    if (existing === undefined) {
      throw new UserNotFoundError(input.userId);
    }

    await this.userRepo.updateProfile(input.userId, input.profile);

    const updated: User = {
      ...existing,
      displayName: input.profile.displayName,
    };
    if (input.profile.profilePhotoKey !== undefined) {
      updated.profilePhotoKey = input.profile.profilePhotoKey;
    }
    if (input.profile.dateOfBirth !== undefined) {
      updated.dateOfBirth = input.profile.dateOfBirth;
    }

    return { user: updated };
  }
}
