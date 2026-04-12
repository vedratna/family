import type { MediaType } from "@family-app/shared";
import type { AppSyncResolverEvent } from "aws-lambda";

import { DomainError } from "../../domain/errors";
import { DynamoMediaRepository } from "../../repositories/dynamodb/media-repo";
import { S3StorageService } from "../../repositories/dynamodb/s3-storage-service";
import { DynamoUserRepository } from "../../repositories/dynamodb/user-repo";
import { ConfirmMediaUpload, GenerateUploadUrl } from "../../use-cases/media";

const userRepo = new DynamoUserRepository();
const mediaRepo = new DynamoMediaRepository();
const storageService = new S3StorageService();

const generateUploadUrl = new GenerateUploadUrl(storageService);
const confirmMediaUpload = new ConfirmMediaUpload(mediaRepo);

interface HandlerArgs {
  [key: string]: unknown;
}

export async function handler(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  try {
    const field = event.info.fieldName;
    switch (field) {
      case "generateUploadUrl":
        return await handleGenerateUploadUrl(event);
      case "confirmMediaUpload":
        return await handleConfirmMediaUpload(event);
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

async function resolveUserId(event: AppSyncResolverEvent<HandlerArgs>): Promise<string> {
  const identity = event.identity as { sub: string } | undefined;
  const cognitoSub = identity?.sub ?? "";
  const user = await userRepo.getByCognitoSub(cognitoSub);
  if (user === undefined) {
    throw new Error("USER_NOT_FOUND: No user found for this Cognito identity");
  }
  return user.id;
}

async function handleGenerateUploadUrl(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const userId = await resolveUserId(event);
  const args = event.arguments;
  return generateUploadUrl.execute({
    familyId: args.familyId as string,
    contentType: args.contentType as string,
    sizeBytes: args.sizeBytes as number,
    userId,
  });
}

async function handleConfirmMediaUpload(
  event: AppSyncResolverEvent<HandlerArgs>,
): Promise<unknown> {
  const userId = await resolveUserId(event);
  const args = event.arguments;
  return confirmMediaUpload.execute({
    s3Key: args.s3Key as string,
    contentType: args.contentType as MediaType,
    sizeBytes: args.sizeBytes as number,
    uploadedBy: userId,
    familyId: args.familyId as string,
  });
}
