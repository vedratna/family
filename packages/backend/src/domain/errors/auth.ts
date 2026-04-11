import { DomainError } from "./base";

export class InvalidOtpError extends DomainError {
  readonly code = "INVALID_OTP";
  readonly statusCode = 401;

  constructor() {
    super("The provided OTP is invalid or expired.");
  }
}

export class UserAlreadyExistsError extends DomainError {
  readonly code = "USER_ALREADY_EXISTS";
  readonly statusCode = 409;

  constructor(phone: string) {
    super(`A user with phone number ${phone} already exists.`);
  }
}

export class UserNotFoundError extends DomainError {
  readonly code = "USER_NOT_FOUND";
  readonly statusCode = 404;

  constructor(identifier: string) {
    super(`User not found: ${identifier}`);
  }
}
