import { DomainError } from "./base";

export class PermissionDeniedError extends DomainError {
  readonly code = "PERMISSION_DENIED";
  readonly statusCode = 403;

  constructor(action: string) {
    super(`Permission denied: ${action}`);
  }
}

export class NotFoundError extends DomainError {
  readonly code = "NOT_FOUND";
  readonly statusCode = 404;

  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`);
  }
}

export class ValidationError extends DomainError {
  readonly code = "VALIDATION_ERROR";
  readonly statusCode = 400;
}

export class ActivationGateError extends DomainError {
  readonly code = "ACTIVATION_GATE";
  readonly statusCode = 403;

  constructor() {
    super("Family must have at least 2 active members before creating content.");
  }
}
