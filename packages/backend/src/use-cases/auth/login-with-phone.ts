import type { User } from "@family-app/shared";

import { UserNotFoundError } from "../../domain/errors";
import type { IUserRepository } from "../../repositories/interfaces";

interface LoginInput {
  cognitoSub: string;
}

interface LoginResult {
  user: User;
}

export class LoginWithPhone {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const user = await this.userRepo.getByCognitoSub(input.cognitoSub);
    if (user === undefined) {
      throw new UserNotFoundError(input.cognitoSub);
    }

    return { user };
  }
}
