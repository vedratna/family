import type { User, UserProfile } from "@family-app/shared";

export interface IUserRepository {
  create(user: User): Promise<void>;
  getById(userId: string): Promise<User | undefined>;
  getByPhone(phone: string): Promise<User | undefined>;
  getByCognitoSub(cognitoSub: string): Promise<User | undefined>;
  updateProfile(userId: string, profile: UserProfile): Promise<void>;
}
