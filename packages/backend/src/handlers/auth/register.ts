import type { AppSyncResolverEvent } from "aws-lambda";

import { DomainError } from "../../domain/errors";
import { DynamoUserRepository } from "../../repositories/dynamodb/user-repo";
import { RegisterWithPhone } from "../../use-cases/auth";

const userRepo = new DynamoUserRepository();
const registerUseCase = new RegisterWithPhone(userRepo);

interface RegisterArgs {
  phone: string;
  cognitoSub: string;
  displayName: string;
}

export async function handler(event: AppSyncResolverEvent<RegisterArgs>) {
  try {
    const result = await registerUseCase.execute({
      phone: event.arguments.phone,
      cognitoSub: event.arguments.cognitoSub,
      displayName: event.arguments.displayName,
    });
    return result.user;
  } catch (error) {
    if (error instanceof DomainError) {
      throw new Error(`${error.code}: ${error.message}`);
    }
    throw error;
  }
}
