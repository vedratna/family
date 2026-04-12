import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock repositories & use cases ---
const {
  mockGetByCognitoSub,
  mockGetByUserId,
  mockGetByFamilyAndPerson,
  mockGetFamilyFeedExecute,
  mockGetPostCommentsExecute,
  mockCreatePostExecute,
  mockDeletePostExecute,
  mockAddReactionExecute,
  mockRemoveReactionExecute,
  mockAddCommentExecute,
} = vi.hoisted(() => ({
  mockGetByCognitoSub: vi.fn(),
  mockGetByUserId: vi.fn(),
  mockGetByFamilyAndPerson: vi.fn(),
  mockGetFamilyFeedExecute: vi.fn(),
  mockGetPostCommentsExecute: vi.fn(),
  mockCreatePostExecute: vi.fn(),
  mockDeletePostExecute: vi.fn(),
  mockAddReactionExecute: vi.fn(),
  mockRemoveReactionExecute: vi.fn(),
  mockAddCommentExecute: vi.fn(),
}));

vi.mock("../../../repositories/dynamodb/user-repo", () => ({
  DynamoUserRepository: vi.fn().mockImplementation(() => ({
    getByCognitoSub: mockGetByCognitoSub,
  })),
}));

vi.mock("../../../repositories/dynamodb/person-repo", () => ({
  DynamoPersonRepository: vi.fn().mockImplementation(() => ({
    getByUserId: mockGetByUserId,
  })),
}));

vi.mock("../../../repositories/dynamodb/membership-repo", () => ({
  DynamoMembershipRepository: vi.fn().mockImplementation(() => ({
    getByFamilyAndPerson: mockGetByFamilyAndPerson,
  })),
}));

vi.mock("../../../repositories/dynamodb/post-repo", () => ({
  DynamoPostRepository: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("../../../repositories/dynamodb/comment-repo", () => ({
  DynamoCommentRepository: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("../../../repositories/dynamodb/reaction-repo", () => ({
  DynamoReactionRepository: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("../../../use-cases/feed", () => ({
  GetFamilyFeed: vi.fn().mockImplementation(() => ({
    execute: mockGetFamilyFeedExecute,
  })),
  GetPostComments: vi.fn().mockImplementation(() => ({
    execute: mockGetPostCommentsExecute,
  })),
  CreatePost: vi.fn().mockImplementation(() => ({
    execute: mockCreatePostExecute,
  })),
  DeletePost: vi.fn().mockImplementation(() => ({
    execute: mockDeletePostExecute,
  })),
  AddReaction: vi.fn().mockImplementation(() => ({
    execute: mockAddReactionExecute,
  })),
  RemoveReaction: vi.fn().mockImplementation(() => ({
    execute: mockRemoveReactionExecute,
  })),
  AddComment: vi.fn().mockImplementation(() => ({
    execute: mockAddCommentExecute,
  })),
}));

vi.mock("../../../domain/errors", () => {
  class DomainError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
      this.statusCode = 400;
      this.name = "DomainError";
    }
  }
  return { DomainError };
});

import { DomainError } from "../../../domain/errors";
import { handler } from "../handler";

function createEvent(fieldName: string, args: Record<string, unknown> = {}, sub = "test-sub") {
  return {
    info: { fieldName },
    arguments: args,
    identity: { sub },
  } as unknown;
}

function mockResolveRequester(personId = "p1", role = "member" as const) {
  mockGetByCognitoSub.mockResolvedValue({ id: "u1" });
  mockGetByUserId.mockResolvedValue({ id: personId });
  mockGetByFamilyAndPerson.mockResolvedValue({ role });
}

describe("feed handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- familyFeed ---
  describe("familyFeed", () => {
    it("returns feed with only familyId", async () => {
      const feed = { items: [], nextCursor: null };
      mockGetFamilyFeedExecute.mockResolvedValue(feed);

      const result = await handler(createEvent("familyFeed", { familyId: "f1" }) as any);

      expect(mockGetFamilyFeedExecute).toHaveBeenCalledWith({ familyId: "f1" });
      expect(result).toEqual(feed);
    });

    it("passes limit and cursor when provided", async () => {
      mockGetFamilyFeedExecute.mockResolvedValue({ items: [] });

      await handler(createEvent("familyFeed", { familyId: "f1", limit: 10, cursor: "abc" }) as any);

      expect(mockGetFamilyFeedExecute).toHaveBeenCalledWith({
        familyId: "f1",
        limit: 10,
        cursor: "abc",
      });
    });

    it("does not pass limit/cursor when they are wrong types", async () => {
      mockGetFamilyFeedExecute.mockResolvedValue({ items: [] });

      await handler(
        createEvent("familyFeed", { familyId: "f1", limit: "ten", cursor: 123 }) as any,
      );

      expect(mockGetFamilyFeedExecute).toHaveBeenCalledWith({ familyId: "f1" });
    });
  });

  // --- postComments ---
  describe("postComments", () => {
    it("returns comments with only postId", async () => {
      const comments = { items: [] };
      mockGetPostCommentsExecute.mockResolvedValue(comments);

      const result = await handler(createEvent("postComments", { postId: "post1" }) as any);

      expect(mockGetPostCommentsExecute).toHaveBeenCalledWith({ postId: "post1" });
      expect(result).toEqual(comments);
    });

    it("passes limit and cursor when provided", async () => {
      mockGetPostCommentsExecute.mockResolvedValue({ items: [] });

      await handler(
        createEvent("postComments", { postId: "post1", limit: 5, cursor: "cur" }) as any,
      );

      expect(mockGetPostCommentsExecute).toHaveBeenCalledWith({
        postId: "post1",
        limit: 5,
        cursor: "cur",
      });
    });
  });

  // --- createPost ---
  describe("createPost", () => {
    it("creates a post with resolved requester", async () => {
      mockResolveRequester("p1", "member" as any);
      const post = { id: "post-1" };
      mockCreatePostExecute.mockResolvedValue(post);

      const result = await handler(
        createEvent("createPost", { familyId: "f1", textContent: "Hello" }) as any,
      );

      expect(mockCreatePostExecute).toHaveBeenCalledWith({
        familyId: "f1",
        authorPersonId: "p1",
        textContent: "Hello",
        requesterRole: "member",
      });
      expect(result).toEqual(post);
    });
  });

  // --- deletePost ---
  describe("deletePost", () => {
    it("deletes a post and returns true", async () => {
      mockResolveRequester("p1", "admin" as any);
      mockDeletePostExecute.mockResolvedValue(undefined);

      const result = await handler(
        createEvent("deletePost", { familyId: "f1", postId: "post-1" }) as any,
      );

      expect(mockDeletePostExecute).toHaveBeenCalledWith({
        familyId: "f1",
        postId: "post-1",
        requesterPersonId: "p1",
        requesterRole: "admin",
      });
      expect(result).toBe(true);
    });
  });

  // --- addReaction ---
  describe("addReaction", () => {
    it("adds reaction with resolved personId", async () => {
      mockResolveRequester("p1");
      const reaction = { id: "r1" };
      mockAddReactionExecute.mockResolvedValue(reaction);

      const result = await handler(
        createEvent("addReaction", { familyId: "f1", postId: "post-1", emoji: "thumbsup" }) as any,
      );

      expect(mockAddReactionExecute).toHaveBeenCalledWith({
        postId: "post-1",
        personId: "p1",
        emoji: "thumbsup",
      });
      expect(result).toEqual(reaction);
    });
  });

  // --- removeReaction ---
  describe("removeReaction", () => {
    it("removes reaction and returns true", async () => {
      mockResolveRequester("p1");
      mockRemoveReactionExecute.mockResolvedValue(undefined);

      const result = await handler(
        createEvent("removeReaction", { familyId: "f1", postId: "post-1" }) as any,
      );

      expect(mockRemoveReactionExecute).toHaveBeenCalledWith("post-1", "p1");
      expect(result).toBe(true);
    });
  });

  // --- addComment ---
  describe("addComment", () => {
    it("adds comment with resolved requester", async () => {
      mockResolveRequester("p1", "member" as any);
      const comment = { id: "c1" };
      mockAddCommentExecute.mockResolvedValue(comment);

      const result = await handler(
        createEvent("addComment", {
          familyId: "f1",
          postId: "post-1",
          textContent: "Nice!",
        }) as any,
      );

      expect(mockAddCommentExecute).toHaveBeenCalledWith({
        postId: "post-1",
        familyId: "f1",
        personId: "p1",
        textContent: "Nice!",
        requesterRole: "member",
      });
      expect(result).toEqual(comment);
    });
  });

  // --- resolveRequester error paths ---
  describe("resolveRequester", () => {
    it("throws when user not found", async () => {
      mockGetByCognitoSub.mockResolvedValue(undefined);

      await expect(
        handler(createEvent("createPost", { familyId: "f1", textContent: "x" }) as any),
      ).rejects.toThrow("USER_NOT_FOUND");
    });

    it("throws when person not found", async () => {
      mockGetByCognitoSub.mockResolvedValue({ id: "u1" });
      mockGetByUserId.mockResolvedValue(undefined);

      await expect(
        handler(createEvent("createPost", { familyId: "f1", textContent: "x" }) as any),
      ).rejects.toThrow("MEMBER_NOT_FOUND: Caller is not a member");
    });

    it("throws when membership not found", async () => {
      mockGetByCognitoSub.mockResolvedValue({ id: "u1" });
      mockGetByUserId.mockResolvedValue({ id: "p1" });
      mockGetByFamilyAndPerson.mockResolvedValue(undefined);

      await expect(
        handler(createEvent("createPost", { familyId: "f1", textContent: "x" }) as any),
      ).rejects.toThrow("MEMBER_NOT_FOUND: No membership found");
    });

    it("uses empty string when identity is undefined", async () => {
      mockGetByCognitoSub.mockResolvedValue(undefined);

      const event = {
        info: { fieldName: "createPost" },
        arguments: { familyId: "f1", textContent: "x" },
        identity: undefined,
      } as unknown;

      await expect(handler(event as any)).rejects.toThrow("USER_NOT_FOUND");
      expect(mockGetByCognitoSub).toHaveBeenCalledWith("");
    });
  });

  // --- unknown field ---
  it("throws on unknown fieldName", async () => {
    await expect(handler(createEvent("unknownField") as any)).rejects.toThrow(
      "Unknown field: unknownField",
    );
  });

  // --- DomainError ---
  it("wraps DomainError with code prefix", async () => {
    mockResolveRequester();
    const domainErr = new (DomainError as any)("post too long", "FEED_INVALID");
    mockCreatePostExecute.mockRejectedValue(domainErr);

    await expect(
      handler(createEvent("createPost", { familyId: "f1", textContent: "x" }) as any),
    ).rejects.toThrow("FEED_INVALID: post too long");
  });

  it("re-throws non-DomainError errors as-is", async () => {
    mockResolveRequester();
    mockCreatePostExecute.mockRejectedValue(new Error("boom"));

    await expect(
      handler(createEvent("createPost", { familyId: "f1", textContent: "x" }) as any),
    ).rejects.toThrow("boom");
  });
});
