import type { CombinedError } from "urql";

/**
 * Map a GraphQL/network error to a friendly user-facing string.
 * Recognizes domain error codes from the backend.
 */
export function formatErrorMessage(error: CombinedError): string {
  const raw = error.message.replace(/^\[GraphQL\]\s*/, "").replace(/^\[Network\]\s*/, "");

  if (raw.includes("ActivationGateError") || raw.includes("at least 2")) {
    return "Invite at least one more member before posting or creating items.";
  }
  if (raw.includes("PermissionDeniedError") || raw.includes("PERMISSION_DENIED")) {
    return "You don't have permission to do this.";
  }
  if (raw.includes("NotFoundError") || raw.includes("NOT_FOUND")) {
    return "Item not found. It may have been deleted.";
  }
  if (raw.includes("UserAlreadyExistsError") || raw.includes("USER_ALREADY_EXISTS")) {
    return "An account with this phone number already exists.";
  }
  if (raw.includes("InvalidOtpError") || raw.includes("INVALID_OTP")) {
    return "Invalid or expired code.";
  }
  if (raw.includes("ValidationError") || raw.includes("VALIDATION_ERROR")) {
    // Strip class name + code prefix, return just the human message
    return raw.replace(/^[A-Z][A-Za-z]*Error:\s*/, "").replace(/^[A-Z_]+:\s*/, "");
  }

  // Default: strip any "ErrorClassName:" or "CODE:" prefix for cleaner display
  return raw.replace(/^[A-Z][A-Za-z]*Error:\s*/, "").replace(/^[A-Z_]+:\s*/, "");
}
