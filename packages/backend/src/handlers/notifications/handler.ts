import type { NotificationCategory } from "@family-app/shared";
import type { AppSyncResolverEvent } from "aws-lambda";

import { DomainError } from "../../domain/errors";
import { DynamoDeviceTokenRepository } from "../../repositories/dynamodb/device-token-repo";
import { DynamoNotificationPrefRepository } from "../../repositories/dynamodb/notification-pref-repo";
import { DynamoUserRepository } from "../../repositories/dynamodb/user-repo";
import {
  GetNotificationPreferences,
  RegisterDeviceToken,
  UpdateNotificationPreference,
} from "../../use-cases/notifications";

const userRepo = new DynamoUserRepository();
const prefRepo = new DynamoNotificationPrefRepository();
const deviceTokenRepo = new DynamoDeviceTokenRepository();

const getNotificationPreferences = new GetNotificationPreferences(prefRepo);
const updateNotificationPreference = new UpdateNotificationPreference(prefRepo);
const registerDeviceToken = new RegisterDeviceToken(deviceTokenRepo);

interface HandlerArgs {
  [key: string]: unknown;
}

export async function handler(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  try {
    const field = event.info.fieldName;
    switch (field) {
      case "notificationPreferences":
        return await handleNotificationPreferences(event);
      case "updateNotificationPreference":
        return await handleUpdateNotificationPreference(event);
      case "registerDeviceToken":
        return await handleRegisterDeviceToken(event);
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

async function handleNotificationPreferences(
  event: AppSyncResolverEvent<HandlerArgs>,
): Promise<unknown> {
  const userId = await resolveUserId(event);
  const args = event.arguments;
  return getNotificationPreferences.execute(userId, args.familyId as string);
}

async function handleUpdateNotificationPreference(
  event: AppSyncResolverEvent<HandlerArgs>,
): Promise<unknown> {
  const userId = await resolveUserId(event);
  const args = event.arguments;
  await updateNotificationPreference.execute({
    userId,
    familyId: args.familyId as string,
    category: args.category as NotificationCategory,
    enabled: args.enabled as boolean,
  });
  return true;
}

async function handleRegisterDeviceToken(
  event: AppSyncResolverEvent<HandlerArgs>,
): Promise<unknown> {
  const userId = await resolveUserId(event);
  const args = event.arguments;
  await registerDeviceToken.execute({
    userId,
    deviceToken: args.deviceToken as string,
    platform: args.platform as "ios" | "android",
  });
  return true;
}
