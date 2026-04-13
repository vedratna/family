import { CombinedError } from "urql";
import { describe, it, expect } from "vitest";

import { formatErrorMessage } from "../error-utils";

function makeError(message: string): CombinedError {
  return new CombinedError({
    graphQLErrors: [{ message }],
  });
}

describe("formatErrorMessage", () => {
  it("maps ActivationGateError to friendly message", () => {
    const err = makeError("ActivationGateError: Family must have at least 2 active members");
    expect(formatErrorMessage(err)).toBe(
      "Invite at least one more member before posting or creating items.",
    );
  });

  it("matches 'at least 2' phrasing without the class name", () => {
    const err = makeError("Family must have at least 2 active members before creating content.");
    expect(formatErrorMessage(err)).toBe(
      "Invite at least one more member before posting or creating items.",
    );
  });

  it("maps PermissionDeniedError", () => {
    const err = makeError("PermissionDeniedError: insufficient role");
    expect(formatErrorMessage(err)).toBe("You don't have permission to do this.");
  });

  it("maps PERMISSION_DENIED code prefix", () => {
    const err = makeError("PERMISSION_DENIED: cannot invite");
    expect(formatErrorMessage(err)).toBe("You don't have permission to do this.");
  });

  it("maps NotFoundError", () => {
    const err = makeError("NotFoundError: post not found");
    expect(formatErrorMessage(err)).toBe("Item not found. It may have been deleted.");
  });

  it("maps UserAlreadyExistsError", () => {
    const err = makeError("UserAlreadyExistsError: phone +911234567890");
    expect(formatErrorMessage(err)).toBe("An account with this phone number already exists.");
  });

  it("strips error class name from generic messages", () => {
    const err = makeError("SomeUnknownError: a thing went wrong");
    expect(formatErrorMessage(err)).toBe("a thing went wrong");
  });

  it("strips leading [GraphQL] prefix added by urql", () => {
    const err = makeError("plain message from server");
    // urql's CombinedError prepends "[GraphQL] " to the GraphQLError's message
    expect(err.message).toContain("[GraphQL]");
    const result = formatErrorMessage(err);
    expect(result).toBe("plain message from server");
  });
});
