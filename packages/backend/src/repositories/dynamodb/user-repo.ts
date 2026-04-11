import type { User, UserProfile } from "@family-app/shared";

import type { IUserRepository } from "../interfaces/user-repo";

import { keys } from "./keys";
import { getItem, putItem, queryItems, updateItem } from "./operations";

export class DynamoUserRepository implements IUserRepository {
  async create(user: User): Promise<void> {
    await putItem({
      PK: keys.user.pk(user.id),
      SK: keys.user.sk.profile,
      GSI1PK: keys.gsi1.phone(user.phone),
      GSI1SK: keys.user.pk(user.id),
      cognitoSub: user.cognitoSub,
      phone: user.phone,
      displayName: user.displayName,
      profilePhotoKey: user.profilePhotoKey,
      dateOfBirth: user.dateOfBirth,
      createdAt: user.createdAt,
      entityType: "User",
    });
  }

  async getById(userId: string): Promise<User | undefined> {
    const item = await getItem(keys.user.pk(userId), keys.user.sk.profile);
    if (item === undefined) {
      return undefined;
    }
    return this.toUser(userId, item);
  }

  async getByPhone(phone: string): Promise<User | undefined> {
    const result = await queryItems("GSI1PK", keys.gsi1.phone(phone), undefined, {
      indexName: "GSI1",
      limit: 1,
    });
    const item = result.items[0];
    if (item === undefined) {
      return undefined;
    }
    const userId = (item["GSI1SK"] as string).replace("USER#", "");
    return this.toUser(userId, item);
  }

  async getByCognitoSub(cognitoSub: string): Promise<User | undefined> {
    // Cognito sub lookup requires a scan or a separate GSI.
    // For now, we store cognitoSub in the item and use a filter.
    // This is acceptable because this lookup only happens during login.
    const result = await queryItems("GSI1PK", keys.gsi1.phone(""), undefined, {
      indexName: "GSI1",
      filterExpression: "cognitoSub = :sub",
      expressionAttributeValues: { ":sub": cognitoSub },
    });
    const item = result.items[0];
    if (item === undefined) {
      return undefined;
    }
    const userId = (item["GSI1SK"] as string).replace("USER#", "");
    return this.toUser(userId, item);
  }

  async updateProfile(userId: string, profile: UserProfile): Promise<void> {
    const updates: Record<string, string> = {};
    updates["displayName"] = profile.displayName;
    if (profile.profilePhotoKey !== undefined) {
      updates["profilePhotoKey"] = profile.profilePhotoKey;
    }
    if (profile.dateOfBirth !== undefined) {
      updates["dateOfBirth"] = profile.dateOfBirth;
    }
    await updateItem(keys.user.pk(userId), keys.user.sk.profile, updates);
  }

  private toUser(userId: string, item: Record<string, unknown>): User {
    const user: User = {
      id: userId,
      cognitoSub: item["cognitoSub"] as string,
      phone: item["phone"] as string,
      displayName: item["displayName"] as string,
      createdAt: item["createdAt"] as string,
    };
    if (typeof item["profilePhotoKey"] === "string") {
      user.profilePhotoKey = item["profilePhotoKey"];
    }
    if (typeof item["dateOfBirth"] === "string") {
      user.dateOfBirth = item["dateOfBirth"];
    }
    return user;
  }
}
