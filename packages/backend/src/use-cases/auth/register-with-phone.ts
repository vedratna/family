import type { User } from "@family-app/shared";

import { UserAlreadyExistsError } from "../../domain/errors";
import type { IUserRepository } from "../../repositories/interfaces";

interface RegisterInput {
  phone: string;
  cognitoSub: string;
  displayName: string;
}

interface RegisterResult {
  user: User;
}

export class RegisterWithPhone {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: RegisterInput): Promise<RegisterResult> {
    const existing = await this.userRepo.getByPhone(input.phone);
    if (existing !== undefined) {
      throw new UserAlreadyExistsError(input.phone);
    }

    const user: User = {
      id: crypto.randomUUID(),
      cognitoSub: input.cognitoSub,
      phone: input.phone,
      displayName: input.displayName,
      createdAt: new Date().toISOString(),
    };

    await this.userRepo.create(user);

    return { user };
  }
}
