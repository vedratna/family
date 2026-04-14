import { describe, it, expect } from "vitest";

import { PermissionDeniedError } from "../../domain/errors";
import { requireRole } from "../permission-check";

describe("requireRole", () => {
  it("allows owner for any minimum role", () => {
    expect(() => {
      requireRole("owner", "viewer", "test");
    }).not.toThrow();
    expect(() => {
      requireRole("owner", "editor", "test");
    }).not.toThrow();
    expect(() => {
      requireRole("owner", "admin", "test");
    }).not.toThrow();
    expect(() => {
      requireRole("owner", "owner", "test");
    }).not.toThrow();
  });

  it("allows admin for admin-or-lower minimum", () => {
    expect(() => {
      requireRole("admin", "admin", "test");
    }).not.toThrow();
    expect(() => {
      requireRole("admin", "editor", "test");
    }).not.toThrow();
    expect(() => {
      requireRole("admin", "viewer", "test");
    }).not.toThrow();
  });

  it("throws PermissionDeniedError when role is insufficient", () => {
    expect(() => {
      requireRole("viewer", "editor", "create posts");
    }).toThrow(PermissionDeniedError);
    expect(() => {
      requireRole("editor", "admin", "remove members");
    }).toThrow(PermissionDeniedError);
    expect(() => {
      requireRole("admin", "owner", "transfer ownership");
    }).toThrow(PermissionDeniedError);
  });
});
