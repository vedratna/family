import { describe, it, expect } from "vitest";

import { InvalidOtpError, UserAlreadyExistsError, UserNotFoundError } from "../auth";
import { DomainError } from "../base";

describe("Auth domain errors", () => {
  it("InvalidOtpError has correct code and message", () => {
    const err = new InvalidOtpError();
    expect(err).toBeInstanceOf(DomainError);
    expect(err.code).toBe("INVALID_OTP");
    expect(err.statusCode).toBe(401);
    expect(err.message).toContain("invalid or expired");
  });

  it("UserAlreadyExistsError includes phone in message", () => {
    const err = new UserAlreadyExistsError("+1234567890");
    expect(err).toBeInstanceOf(DomainError);
    expect(err.code).toBe("USER_ALREADY_EXISTS");
    expect(err.statusCode).toBe(409);
    expect(err.message).toContain("+1234567890");
  });

  it("UserNotFoundError includes identifier in message", () => {
    const err = new UserNotFoundError("u-123");
    expect(err).toBeInstanceOf(DomainError);
    expect(err.code).toBe("USER_NOT_FOUND");
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain("u-123");
  });
});
