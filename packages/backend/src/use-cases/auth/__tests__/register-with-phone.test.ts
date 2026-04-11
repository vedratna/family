import type { User } from "@family-app/shared";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { UserAlreadyExistsError } from "../../../domain/errors";
import type { IUserRepository } from "../../../repositories/interfaces";
import { RegisterWithPhone } from "../register-with-phone";

function createMockUserRepo(): IUserRepository {
  return {
    create: vi.fn(),
    getById: vi.fn(),
    getByPhone: vi.fn(),
    getByCognitoSub: vi.fn(),
    updateProfile: vi.fn(),
  };
}

describe("RegisterWithPhone", () => {
  let userRepo: IUserRepository;
  let useCase: RegisterWithPhone;

  beforeEach(() => {
    userRepo = createMockUserRepo();
    useCase = new RegisterWithPhone(userRepo);
  });

  it("creates a new user when phone is not registered", async () => {
    vi.mocked(userRepo.getByPhone).mockResolvedValue(undefined);
    vi.mocked(userRepo.create).mockResolvedValue(undefined);

    const result = await useCase.execute({
      phone: "+919876543210",
      cognitoSub: "cognito-123",
      displayName: "Priya",
    });

    expect(result.user.phone).toBe("+919876543210");
    expect(result.user.displayName).toBe("Priya");
    expect(result.user.cognitoSub).toBe("cognito-123");
    expect(result.user.id).toBeDefined();
    expect(result.user.createdAt).toBeDefined();
    expect(userRepo.create).toHaveBeenCalledOnce();
  });

  it("throws UserAlreadyExistsError when phone is already registered", async () => {
    const existing: User = {
      id: "existing-id",
      cognitoSub: "existing-sub",
      phone: "+919876543210",
      displayName: "Existing User",
      createdAt: "2026-01-01T00:00:00Z",
    };
    vi.mocked(userRepo.getByPhone).mockResolvedValue(existing);

    await expect(
      useCase.execute({
        phone: "+919876543210",
        cognitoSub: "cognito-456",
        displayName: "Priya",
      }),
    ).rejects.toThrow(UserAlreadyExistsError);

    expect(userRepo.create).not.toHaveBeenCalled();
  });
});
