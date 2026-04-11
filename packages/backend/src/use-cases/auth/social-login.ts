import type { User } from "@family-app/shared";

import type { IUserRepository } from "../../repositories/interfaces";

interface SocialLoginInput {
  cognitoSub: string;
  phone: string;
  displayName: string;
}

interface SocialLoginResult {
  user: User;
  isNewUser: boolean;
}

export class SocialLogin {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: SocialLoginInput): Promise<SocialLoginResult> {
    const existing = await this.userRepo.getByCognitoSub(input.cognitoSub);
    if (existing !== undefined) {
      return { user: existing, isNewUser: false };
    }

    const user: User = {
      id: crypto.randomUUID(),
      cognitoSub: input.cognitoSub,
      phone: input.phone,
      displayName: input.displayName,
      createdAt: new Date().toISOString(),
    };

    await this.userRepo.create(user);

    return { user, isNewUser: true };
  }
}
