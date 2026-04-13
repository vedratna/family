import { describe, it, expect } from "vitest";

import {
  isAdmin,
  canEditPost,
  canDeletePost,
  canEditEvent,
  canDeleteEvent,
  canEditChore,
  canDeleteChore,
  canEditRelationship,
  canDeleteRelationship,
  canManageMembers,
} from "../permissions";

describe("isAdmin", () => {
  it("returns true for owner", () => {
    expect(isAdmin("owner")).toBe(true);
  });
  it("returns true for admin", () => {
    expect(isAdmin("admin")).toBe(true);
  });
  it("returns false for editor", () => {
    expect(isAdmin("editor")).toBe(false);
  });
  it("returns false for viewer", () => {
    expect(isAdmin("viewer")).toBe(false);
  });
  it("returns false for undefined", () => {
    expect(isAdmin(undefined)).toBe(false);
  });
});

describe("canEditPost / canDeletePost", () => {
  it("allows author to edit their own post", () => {
    expect(canEditPost("viewer", "person-1", "person-1")).toBe(true);
  });
  it("allows admin to edit any post", () => {
    expect(canEditPost("admin", "person-1", "person-2")).toBe(true);
  });
  it("allows owner to edit any post", () => {
    expect(canEditPost("owner", "person-1", "person-2")).toBe(true);
  });
  it("disallows viewer from editing others post", () => {
    expect(canEditPost("viewer", "person-1", "person-2")).toBe(false);
  });
  it("disallows editor from editing others post", () => {
    expect(canEditPost("editor", "person-1", "person-2")).toBe(false);
  });
  it("disallows when activePersonId is undefined", () => {
    expect(canEditPost("viewer", "person-1", undefined)).toBe(false);
  });
  it("canDeletePost behaves the same as canEditPost", () => {
    expect(canDeletePost("admin", "p1", "p2")).toBe(true);
    expect(canDeletePost("viewer", "p1", "p2")).toBe(false);
  });
});

describe("canEditEvent / canDeleteEvent", () => {
  it("allows creator to edit their own event", () => {
    expect(canEditEvent("viewer", "person-1", "person-1")).toBe(true);
  });
  it("allows admin to edit any event", () => {
    expect(canEditEvent("admin", "person-1", "person-2")).toBe(true);
  });
  it("disallows viewer from editing others event", () => {
    expect(canEditEvent("viewer", "person-1", "person-2")).toBe(false);
  });
  it("canDeleteEvent behaves the same", () => {
    expect(canDeleteEvent("owner", "p1", "p2")).toBe(true);
    expect(canDeleteEvent("editor", "p1", "p2")).toBe(false);
  });
});

describe("canEditChore / canDeleteChore", () => {
  it("allows owner", () => {
    expect(canEditChore("owner")).toBe(true);
  });
  it("allows admin", () => {
    expect(canEditChore("admin")).toBe(true);
  });
  it("allows editor", () => {
    expect(canEditChore("editor")).toBe(true);
  });
  it("disallows viewer", () => {
    expect(canEditChore("viewer")).toBe(false);
  });
  it("disallows undefined", () => {
    expect(canEditChore(undefined)).toBe(false);
  });
  it("canDeleteChore behaves the same", () => {
    expect(canDeleteChore("editor")).toBe(true);
    expect(canDeleteChore("viewer")).toBe(false);
  });
});

describe("canEditRelationship / canDeleteRelationship", () => {
  it("allows owner", () => {
    expect(canEditRelationship("owner")).toBe(true);
  });
  it("allows admin", () => {
    expect(canEditRelationship("admin")).toBe(true);
  });
  it("disallows editor", () => {
    expect(canEditRelationship("editor")).toBe(false);
  });
  it("disallows viewer", () => {
    expect(canEditRelationship("viewer")).toBe(false);
  });
  it("canDeleteRelationship behaves the same", () => {
    expect(canDeleteRelationship("admin")).toBe(true);
    expect(canDeleteRelationship("viewer")).toBe(false);
  });
});

describe("canManageMembers", () => {
  it("allows owner", () => {
    expect(canManageMembers("owner")).toBe(true);
  });
  it("allows admin", () => {
    expect(canManageMembers("admin")).toBe(true);
  });
  it("disallows editor", () => {
    expect(canManageMembers("editor")).toBe(false);
  });
  it("disallows viewer", () => {
    expect(canManageMembers("viewer")).toBe(false);
  });
  it("disallows undefined", () => {
    expect(canManageMembers(undefined)).toBe(false);
  });
});
