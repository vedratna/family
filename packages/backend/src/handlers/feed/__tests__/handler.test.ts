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
  mockPersonRepoGetByFamilyId,
  mockPostRepoGetById,
  mockReactionRepoGetByPostId,
  mockCommentRepoGetByPostId,
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
  mockPersonRepoGetByFamilyId: vi.fn(),
  mockPostRepoGetById: vi.fn(),
  mockReactionRepoGetByPostId: vi.fn(),
  mockCommentRepoGetByPostId: vi.fn(),
}));

vi.mock("../../../repositories/dynamodb/user-repo", () => ({
  DynamoUserRepository: vi.fn().mockImplementation(() => ({
    getByCognitoSub: mockGetByCognitoSub,
  })),
}));

vi.mock("../../../repositories/dynamodb/person-repo", () => ({
  DynamoPersonRepository: vi.fn().mockImplementation(() => ({
    getByUserId: mockGetByUserId,
    getByFamilyId: mockPersonRepoGetByFamilyId,
  })),
}));

vi.mock("../../../repositories/dynamodb/membership-repo", () => ({
  DynamoMembershipRepository: vi.fn().mockImplementation(() => ({
    getByFamilyAndPerson: mockGetByFamilyAndPerson,
  })),
}));

vi.mock("../../../repositories/dynamodb/post-repo", () => ({
  DynamoPostRepository: vi.fn().mockImplementation(() => ({
    getById: mockPostRepoGetById,
  })),
}));

vi.mock("../../../repositories/dynamodb/comment-repo", () => ({
  DynamoCommentRepository: vi.fn().mockImplementation(() => ({
    getByPostId: mockCommentRepoGetByPostId,
  })),
}));

vi.mock("../../../repositories/dynamodb/reaction-repo", () => ({
  DynamoReactionRepository: vi.fn().mockImplementation(() => ({
    getByPostId: mockReactionRepoGetByPostId,
  })),
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

/** Set up personRepo to return known persons for name resolution */
function mockPersonNames(familyId: string, persons: { id: string; name: string }[]) {
  mockPersonRepoGetByFamilyId.mockImplementation((fId: string) => {
    if (fId === familyId) return Promise.resolve(persons);
    return Promise.resolve([]);
  });
}

describe("feed handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no reactions, no comments for enrichment
    mockReactionRepoGetByPostId.mockResolvedValue([]);
    mockCommentRepoGetByPostId.mockResolvedValue({ items: [], cursor: undefined });
  });

  // --- familyFeed ---
  describe("familyFeed", () => {
    it("returns enriched feed with authorName and counts", async () => {
      mockPersonNames("f1", [{ id: "author1", name: "Mickey Mouse" }]);
      mockReactionRepoGetByPostId.mockResolvedValue([{ postId: "post1" }, { postId: "post1" }]);
      mockCommentRepoGetByPostId.mockResolvedValue({ items: [{ id: "c1" }], cursor: undefined });

      const feed = {
        items: [
          {
            id: "post1",
            familyId: "f1",
            authorPersonId: "author1",
            textContent: "Hello",
            isSystemPost: false,
            createdAt: "2024-01-01",
          },
        ],
        cursor: "next-cursor",
      };
      mockGetFamilyFeedExecute.mockResolvedValue(feed);

      const result = (await handler(
        createEvent("familyFeed", { familyId: "f1" }) as Parameters<typeof handler>[0],
      )) as {
        items: { authorName: string; reactionCount: number; commentCount: number }[];
        cursor: string;
      };

      expect(mockGetFamilyFeedExecute).toHaveBeenCalledWith({ familyId: "f1" });
      expect(result.items).toHaveLength(1);
      const firstItem = result.items[0] as {
        authorName: string;
        reactionCount: number;
        commentCount: number;
      };
      expect(firstItem.authorName).toBe("Mickey Mouse");
      expect(firstItem.reactionCount).toBe(2);
      expect(firstItem.commentCount).toBe(1);
      expect(result.cursor).toBe("next-cursor");
    });

    it("passes limit and cursor when provided", async () => {
      mockPersonNames("f1", []);
      mockGetFamilyFeedExecute.mockResolvedValue({ items: [], cursor: undefined });

      await handler(
        createEvent("familyFeed", { familyId: "f1", limit: 10, cursor: "abc" }) as Parameters<
          typeof handler
        >[0],
      );

      expect(mockGetFamilyFeedExecute).toHaveBeenCalledWith({
        familyId: "f1",
        limit: 10,
        cursor: "abc",
      });
    });

    it("does not pass limit/cursor when they are wrong types", async () => {
      mockPersonNames("f1", []);
      mockGetFamilyFeedExecute.mockResolvedValue({ items: [], cursor: undefined });

      await handler(
        createEvent("familyFeed", { familyId: "f1", limit: "ten", cursor: 123 }) as Parameters<
          typeof handler
        >[0],
      );

      expect(mockGetFamilyFeedExecute).toHaveBeenCalledWith({ familyId: "f1" });
    });
  });

  // --- postDetail ---
  describe("postDetail", () => {
    it("returns enriched post when found", async () => {
      mockPersonNames("f1", [{ id: "author1", name: "Donald Duck" }]);
      const post = {
        id: "post1",
        familyId: "f1",
        authorPersonId: "author1",
        textContent: "Hi",
        isSystemPost: false,
        createdAt: "2024-01-01",
      };
      mockPostRepoGetById.mockResolvedValue(post);

      const result = (await handler(
        createEvent("postDetail", { postId: "post1", familyId: "f1" }) as Parameters<
          typeof handler
        >[0],
      )) as { authorName: string; reactionCount: number; commentCount: number } | null;

      expect(result).not.toBeNull();
      const enrichedPost = result as {
        authorName: string;
        reactionCount: number;
        commentCount: number;
      };
      expect(enrichedPost.authorName).toBe("Donald Duck");
      expect(enrichedPost.reactionCount).toBe(0);
      expect(enrichedPost.commentCount).toBe(0);
    });

    it("returns null when post not found", async () => {
      mockPostRepoGetById.mockResolvedValue(undefined);

      const result = await handler(
        createEvent("postDetail", { postId: "nope", familyId: "f1" }) as Parameters<
          typeof handler
        >[0],
      );

      expect(result).toBeNull();
    });
  });

  // --- postComments ---
  describe("postComments", () => {
    it("returns enriched comments with personName", async () => {
      mockPersonNames("f1", [{ id: "commenter1", name: "Goofy" }]);
      mockPostRepoGetById.mockResolvedValue({ id: "post1", familyId: "f1" });
      const comments = {
        items: [
          {
            id: "c1",
            postId: "post1",
            personId: "commenter1",
            textContent: "Nice!",
            createdAt: "2024-01-01",
          },
        ],
        cursor: undefined,
      };
      mockGetPostCommentsExecute.mockResolvedValue(comments);

      const result = (await handler(
        createEvent("postComments", { postId: "post1" }) as Parameters<typeof handler>[0],
      )) as { items: { personName: string }[] };

      expect(result.items).toHaveLength(1);
      const firstComment = result.items[0] as { personName: string };
      expect(firstComment.personName).toBe("Goofy");
    });

    it("passes limit and cursor when provided", async () => {
      mockPersonNames("f1", []);
      mockPostRepoGetById.mockResolvedValue({ id: "post1", familyId: "f1" });
      mockGetPostCommentsExecute.mockResolvedValue({ items: [], cursor: undefined });

      await handler(
        createEvent("postComments", { postId: "post1", limit: 5, cursor: "cur" }) as Parameters<
          typeof handler
        >[0],
      );

      expect(mockGetPostCommentsExecute).toHaveBeenCalledWith({
        postId: "post1",
        limit: 5,
        cursor: "cur",
      });
    });
  });

  // --- postReactions ---
  describe("postReactions", () => {
    it("returns enriched reactions with personName", async () => {
      mockPersonNames("f1", [{ id: "reactor1", name: "Pluto" }]);
      mockPostRepoGetById.mockResolvedValue({ id: "post1", familyId: "f1" });
      mockReactionRepoGetByPostId.mockResolvedValue([
        { postId: "post1", personId: "reactor1", emoji: "thumbsup", createdAt: "2024-01-01" },
      ]);

      const result = (await handler(
        createEvent("postReactions", { postId: "post1" }) as Parameters<typeof handler>[0],
      )) as { personName: string }[];

      expect(result).toHaveLength(1);
      const firstReaction = result[0] as { personName: string };
      expect(firstReaction.personName).toBe("Pluto");
    });
  });

  // --- createPost ---
  describe("createPost", () => {
    it("creates a post and returns enriched result", async () => {
      mockResolveRequester("p1", "member" as Parameters<typeof mockResolveRequester>[1]);
      mockPersonNames("f1", [{ id: "p1", name: "Minnie Mouse" }]);
      const post = {
        id: "post-1",
        familyId: "f1",
        authorPersonId: "p1",
        textContent: "Hello",
        isSystemPost: false,
        createdAt: "2024-01-01",
      };
      mockCreatePostExecute.mockResolvedValue(post);

      const result = (await handler(
        createEvent("createPost", { familyId: "f1", textContent: "Hello" }) as Parameters<
          typeof handler
        >[0],
      )) as { authorName: string; reactionCount: number; commentCount: number };

      expect(mockCreatePostExecute).toHaveBeenCalledWith({
        familyId: "f1",
        authorPersonId: "p1",
        textContent: "Hello",
        requesterRole: "member",
      });
      expect(result.authorName).toBe("Minnie Mouse");
      expect(result.reactionCount).toBe(0);
      expect(result.commentCount).toBe(0);
    });
  });

  // --- deletePost ---
  describe("deletePost", () => {
    it("deletes a post and returns true", async () => {
      mockResolveRequester("p1", "admin" as Parameters<typeof mockResolveRequester>[1]);
      mockDeletePostExecute.mockResolvedValue(undefined);

      const result = await handler(
        createEvent("deletePost", { familyId: "f1", postId: "post-1" }) as Parameters<
          typeof handler
        >[0],
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
    it("adds reaction and returns enriched result with personName", async () => {
      mockResolveRequester("p1");
      mockPersonNames("f1", [{ id: "p1", name: "Daisy Duck" }]);
      const reaction = {
        postId: "post-1",
        personId: "p1",
        emoji: "thumbsup",
        createdAt: "2024-01-01",
      };
      mockAddReactionExecute.mockResolvedValue(reaction);

      const result = (await handler(
        createEvent("addReaction", {
          familyId: "f1",
          postId: "post-1",
          emoji: "thumbsup",
        }) as Parameters<typeof handler>[0],
      )) as { personName: string };

      expect(mockAddReactionExecute).toHaveBeenCalledWith({
        postId: "post-1",
        personId: "p1",
        emoji: "thumbsup",
      });
      expect(result.personName).toBe("Daisy Duck");
    });
  });

  // --- removeReaction ---
  describe("removeReaction", () => {
    it("removes reaction and returns true", async () => {
      mockResolveRequester("p1");
      mockRemoveReactionExecute.mockResolvedValue(undefined);

      const result = await handler(
        createEvent("removeReaction", { familyId: "f1", postId: "post-1" }) as Parameters<
          typeof handler
        >[0],
      );

      expect(mockRemoveReactionExecute).toHaveBeenCalledWith("post-1", "p1");
      expect(result).toBe(true);
    });
  });

  // --- addComment ---
  describe("addComment", () => {
    it("adds comment and returns enriched result with personName", async () => {
      mockResolveRequester("p1", "member" as Parameters<typeof mockResolveRequester>[1]);
      mockPersonNames("f1", [{ id: "p1", name: "Chip" }]);
      const comment = {
        id: "c1",
        postId: "post-1",
        personId: "p1",
        textContent: "Nice!",
        createdAt: "2024-01-01",
      };
      mockAddCommentExecute.mockResolvedValue(comment);

      const result = (await handler(
        createEvent("addComment", {
          familyId: "f1",
          postId: "post-1",
          textContent: "Nice!",
        }) as Parameters<typeof handler>[0],
      )) as { personName: string };

      expect(mockAddCommentExecute).toHaveBeenCalledWith({
        postId: "post-1",
        familyId: "f1",
        personId: "p1",
        textContent: "Nice!",
        requesterRole: "member",
      });
      expect(result.personName).toBe("Chip");
    });
  });

  // --- resolveRequester error paths ---
  describe("resolveRequester", () => {
    it("throws when user not found", async () => {
      mockGetByCognitoSub.mockResolvedValue(undefined);

      await expect(
        handler(
          createEvent("createPost", { familyId: "f1", textContent: "x" }) as Parameters<
            typeof handler
          >[0],
        ),
      ).rejects.toThrow("USER_NOT_FOUND");
    });

    it("throws when person not found", async () => {
      mockGetByCognitoSub.mockResolvedValue({ id: "u1" });
      mockGetByUserId.mockResolvedValue(undefined);

      await expect(
        handler(
          createEvent("createPost", { familyId: "f1", textContent: "x" }) as Parameters<
            typeof handler
          >[0],
        ),
      ).rejects.toThrow("MEMBER_NOT_FOUND: Caller is not a member");
    });

    it("throws when membership not found", async () => {
      mockGetByCognitoSub.mockResolvedValue({ id: "u1" });
      mockGetByUserId.mockResolvedValue({ id: "p1" });
      mockGetByFamilyAndPerson.mockResolvedValue(undefined);

      await expect(
        handler(
          createEvent("createPost", { familyId: "f1", textContent: "x" }) as Parameters<
            typeof handler
          >[0],
        ),
      ).rejects.toThrow("MEMBER_NOT_FOUND: No membership found");
    });

    it("uses empty string when identity is undefined", async () => {
      mockGetByCognitoSub.mockResolvedValue(undefined);

      const event = {
        info: { fieldName: "createPost" },
        arguments: { familyId: "f1", textContent: "x" },
        identity: undefined,
      } as unknown;

      await expect(handler(event as Parameters<typeof handler>[0])).rejects.toThrow(
        "USER_NOT_FOUND",
      );
      expect(mockGetByCognitoSub).toHaveBeenCalledWith("");
    });
  });

  // --- unknown field ---
  it("throws on unknown fieldName", async () => {
    await expect(
      handler(createEvent("unknownField") as Parameters<typeof handler>[0]),
    ).rejects.toThrow("Unknown field: unknownField");
  });

  // --- DomainError ---
  it("wraps DomainError with code prefix", async () => {
    mockResolveRequester();
    mockPersonNames("f1", [{ id: "p1", name: "Test" }]);
    const domainErr = new (DomainError as unknown as new (msg: string, code: string) => Error)(
      "post too long",
      "FEED_INVALID",
    );
    mockCreatePostExecute.mockRejectedValue(domainErr);

    await expect(
      handler(
        createEvent("createPost", { familyId: "f1", textContent: "x" }) as Parameters<
          typeof handler
        >[0],
      ),
    ).rejects.toThrow("FEED_INVALID: post too long");
  });

  it("re-throws non-DomainError errors as-is", async () => {
    mockResolveRequester();
    mockPersonNames("f1", [{ id: "p1", name: "Test" }]);
    mockCreatePostExecute.mockRejectedValue(new Error("boom"));

    await expect(
      handler(
        createEvent("createPost", { familyId: "f1", textContent: "x" }) as Parameters<
          typeof handler
        >[0],
      ),
    ).rejects.toThrow("boom");
  });
});
