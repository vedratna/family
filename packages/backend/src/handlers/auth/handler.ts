import type { AppSyncResolverEvent } from "aws-lambda";

import { DomainError } from "../../domain/errors";
import { DynamoUserRepository } from "../../repositories/dynamodb/user-repo";
import { RegisterWithPhone, UpdateUserProfile } from "../../use-cases/auth";

const userRepo = new DynamoUserRepository();
const registerUseCase = new RegisterWithPhone(userRepo);
const updateProfileUseCase = new UpdateUserProfile(userRepo);

interface HandlerArgs {
  [key: string]: unknown;
}

export async function handler(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  try {
    const field = event.info.fieldName;
    switch (field) {
      case "register":
        return await handleRegister(event);
      case "updateProfile":
        return await handleUpdateProfile(event);
      default:
        throw new Error(`Unknown field: ${field}`);
    }
  } catch (error: unknown) {
    if (error instanceof DomainError) {
      throw new Error(`${error.code}: ${error.message}`);
    }
    throw error;
  }
}

async function handleRegister(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const args = event.arguments;
  const result = await registerUseCase.execute({
    phone: args.phone as string,
    cognitoSub: args.cognitoSub as string,
    displayName: args.displayName as string,
  });
  return result.user;
}

async function handleUpdateProfile(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const identity = event.identity as { sub: string } | undefined;
  const cognitoSub = identity?.sub ?? "";
  const user = await userRepo.getByCognitoSub(cognitoSub);
  if (user === undefined) {
    throw new Error("USER_NOT_FOUND: No user found for this Cognito identity");
  }

  const args = event.arguments;
  const result = await updateProfileUseCase.execute({
    userId: user.id,
    profile: args.profile as {
      displayName: string;
      profilePhotoKey?: string;
      dateOfBirth?: string;
    },
  });
  return result.user;
}
