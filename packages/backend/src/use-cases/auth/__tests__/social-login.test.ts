import type { User } from "@family-app/shared";
import { describe, it, expect, beforeEach, vi } from "vitest";

import type { IUserRepository } from "../../../repositories/interfaces";
import { SocialLogin } from "../social-login";

function createMockUserRepo(): IUserRepository {
  return {
    create: vi.fn(),
    getById: vi.fn(),
    getByPhone: vi.fn(),
    getByCognitoSub: vi.fn(),
    updateProfile: vi.fn(),
  };
}

describe("SocialLogin", () => {
  let userRepo: IUserRepository;
  let useCase: SocialLogin;

  beforeEach(() => {
    userRepo = createMockUserRepo();
    useCase = new SocialLogin(userRepo);
  });

  it("returns existing user when cognito sub matches", async () => {
    const existing: User = {
      id: "user-1",
      cognitoSub: "google-123",
      phone: "+919876543210",
      displayName: "Priya",
      createdAt: "2026-01-01T00:00:00Z",
    };
    vi.mocked(userRepo.getByCognitoSub).mockResolvedValue(existing);

    const result = await useCase.execute({
      cognitoSub: "google-123",
      phone: "+919876543210",
      displayName: "Priya",
    });

    expect(result.user).toEqual(existing);
    expect(result.isNewUser).toBe(false);
    expect(userRepo.create).not.toHaveBeenCalled();
  });

  it("creates new user when cognito sub not found", async () => {
    vi.mocked(userRepo.getByCognitoSub).mockResolvedValue(undefined);
    vi.mocked(userRepo.create).mockResolvedValue(undefined);

    const result = await useCase.execute({
      cognitoSub: "google-456",
      phone: "+919876543210",
      displayName: "Rajesh",
    });

    expect(result.isNewUser).toBe(true);
    expect(result.user.displayName).toBe("Rajesh");
    expect(result.user.cognitoSub).toBe("google-456");
    expect(userRepo.create).toHaveBeenCalledOnce();
  });
});
