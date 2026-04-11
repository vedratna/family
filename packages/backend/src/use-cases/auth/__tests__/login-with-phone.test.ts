import type { User } from "@family-app/shared";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { UserNotFoundError } from "../../../domain/errors";
import type { IUserRepository } from "../../../repositories/interfaces";
import { LoginWithPhone } from "../login-with-phone";

function createMockUserRepo(): IUserRepository {
  return {
    create: vi.fn(),
    getById: vi.fn(),
    getByPhone: vi.fn(),
    getByCognitoSub: vi.fn(),
    updateProfile: vi.fn(),
  };
}

describe("LoginWithPhone", () => {
  let userRepo: IUserRepository;
  let useCase: LoginWithPhone;

  beforeEach(() => {
    userRepo = createMockUserRepo();
    useCase = new LoginWithPhone(userRepo);
  });

  it("returns user when cognito sub matches", async () => {
    const user: User = {
      id: "user-1",
      cognitoSub: "cognito-123",
      phone: "+919876543210",
      displayName: "Priya",
      createdAt: "2026-01-01T00:00:00Z",
    };
    vi.mocked(userRepo.getByCognitoSub).mockResolvedValue(user);

    const result = await useCase.execute({ cognitoSub: "cognito-123" });

    expect(result.user).toEqual(user);
  });

  it("throws UserNotFoundError when cognito sub not found", async () => {
    vi.mocked(userRepo.getByCognitoSub).mockResolvedValue(undefined);

    await expect(useCase.execute({ cognitoSub: "nonexistent" })).rejects.toThrow(UserNotFoundError);
  });
});
