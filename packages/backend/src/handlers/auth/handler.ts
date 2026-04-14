import type { AppSyncResolverEvent } from "aws-lambda";

import { DomainError } from "../../domain/errors";
import { S3StorageService } from "../../repositories/dynamodb/s3-storage-service";
import { DynamoUserRepository } from "../../repositories/dynamodb/user-repo";
import { RegisterWithPhone, UpdateUserProfile } from "../../use-cases/auth";
import { resolveProfilePhotoUrl } from "../_shared/enrichment";

const userRepo = new DynamoUserRepository();
const storageService = new S3StorageService();
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
      case "userByPhone":
        return await handleUserByPhone(event);
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
  const profilePhotoUrl = await resolveProfilePhotoUrl(result.user.profilePhotoKey, storageService);
  return { ...result.user, profilePhotoUrl };
}

async function handleUserByPhone(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const phone = event.arguments.phone as string;
  const user = await userRepo.getByPhone(phone);
  if (user === undefined) {
    return null;
  }
  const profilePhotoUrl = await resolveProfilePhotoUrl(user.profilePhotoKey, storageService);
  return { ...user, profilePhotoUrl };
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
  const profilePhotoUrl = await resolveProfilePhotoUrl(result.user.profilePhotoKey, storageService);
  return { ...result.user, profilePhotoUrl };
}
