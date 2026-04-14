import type {
  Person,
  Post,
  Comment as TComment,
  Reaction,
  FamilyEvent,
  EventRSVP,
} from "@family-app/shared";
import { describe, it, expect, vi } from "vitest";

import type {
  IMediaRepository,
  IStorageService,
} from "../../../repositories/interfaces/media-repo";
import type { IPersonRepository } from "../../../repositories/interfaces/person-repo";
import type {
  ICommentRepository,
  IReactionRepository,
} from "../../../repositories/interfaces/post-repo";
import {
  PersonNameResolver,
  resolveMediaUrls,
  resolveProfilePhotoUrl,
  enrichPosts,
  enrichSinglePost,
  enrichComments,
  enrichReactions,
  enrichEvents,
  enrichRSVPs,
} from "../enrichment";

function mockPersonRepo(persons: Person[] = []): IPersonRepository {
  return {
    create: vi.fn(),
    getById: vi.fn(),
    getByFamilyId: vi.fn().mockResolvedValue(persons),
    getByUserId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

const persons: Person[] = [
  {
    id: "person-1",
    familyId: "fam-1",
    name: "Mickey Mouse",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "person-2",
    familyId: "fam-1",
    name: "Minnie Mouse",
    createdAt: "2026-01-01T00:00:00Z",
  },
];

describe("PersonNameResolver", () => {
  it("resolves person name from family", async () => {
    const repo = mockPersonRepo(persons);
    const resolver = new PersonNameResolver(repo);
    expect(await resolver.getName("fam-1", "person-1")).toBe("Mickey Mouse");
  });

  it("returns 'System' for personId 'system' without DB call", async () => {
    const repo = mockPersonRepo(persons);
    const resolver = new PersonNameResolver(repo);
    expect(await resolver.getName("fam-1", "system")).toBe("System");
    expect(repo.getByFamilyId).not.toHaveBeenCalled();
  });

  it("returns 'Unknown' for missing person", async () => {
    const repo = mockPersonRepo(persons);
    const resolver = new PersonNameResolver(repo);
    expect(await resolver.getName("fam-1", "person-missing")).toBe("Unknown");
  });

  it("caches per-family lookups (single DB call for repeated names)", async () => {
    const repo = mockPersonRepo(persons);
    const resolver = new PersonNameResolver(repo);
    await resolver.getName("fam-1", "person-1");
    await resolver.getName("fam-1", "person-2");
    await resolver.getName("fam-1", "person-1");
    expect(repo.getByFamilyId).toHaveBeenCalledOnce();
  });

  it("caches separately per family", async () => {
    const repo = mockPersonRepo(persons);
    const resolver = new PersonNameResolver(repo);
    await resolver.getName("fam-1", "person-1");
    await resolver.getName("fam-2", "person-1");
    expect(repo.getByFamilyId).toHaveBeenCalledTimes(2);
  });
});

function mockMediaRepo(): IMediaRepository {
  return { create: vi.fn(), getById: vi.fn(), getByFamily: vi.fn() };
}

function mockStorageService(): IStorageService {
  return { generateUploadUrl: vi.fn(), generateDownloadUrl: vi.fn() };
}

function mockReactionRepo(): IReactionRepository {
  return { add: vi.fn(), remove: vi.fn(), getByPostId: vi.fn() };
}

function mockCommentRepo(): ICommentRepository {
  return { create: vi.fn(), getByPostId: vi.fn(), delete: vi.fn() };
}

describe("resolveMediaUrls", () => {
  it("returns empty array for undefined mediaIds", async () => {
    const result = await resolveMediaUrls(undefined, mockMediaRepo(), mockStorageService());
    expect(result).toEqual([]);
  });

  it("returns empty array for empty mediaIds", async () => {
    const result = await resolveMediaUrls([], mockMediaRepo(), mockStorageService());
    expect(result).toEqual([]);
  });

  it("resolves media URLs for valid media IDs", async () => {
    const mediaRepo = mockMediaRepo();
    const storage = mockStorageService();
    vi.mocked(mediaRepo.getById).mockResolvedValue({
      id: "m1",
      s3Key: "media/photo.jpg",
      contentType: "image/jpeg",
      sizeBytes: 1024,
      uploadedBy: "u1",
      familyId: "f1",
      createdAt: "",
    });
    vi.mocked(storage.generateDownloadUrl).mockResolvedValue("https://signed-url");

    const result = await resolveMediaUrls(["m1"], mediaRepo, storage);

    expect(result).toEqual(["https://signed-url"]);
  });

  it("filters out null when media not found", async () => {
    const mediaRepo = mockMediaRepo();
    vi.mocked(mediaRepo.getById).mockResolvedValue(undefined);

    const result = await resolveMediaUrls(["m-gone"], mediaRepo, mockStorageService());

    expect(result).toEqual([]);
  });
});

describe("resolveProfilePhotoUrl", () => {
  it("returns null for undefined key", async () => {
    expect(await resolveProfilePhotoUrl(undefined, mockStorageService())).toBeNull();
  });

  it("returns null for empty string key", async () => {
    expect(await resolveProfilePhotoUrl("", mockStorageService())).toBeNull();
  });

  it("returns URL for valid key", async () => {
    const storage = mockStorageService();
    vi.mocked(storage.generateDownloadUrl).mockResolvedValue("https://photo-url");

    expect(await resolveProfilePhotoUrl("photos/me.jpg", storage)).toBe("https://photo-url");
  });
});

describe("enrichPosts", () => {
  it("enriches posts with author name, counts, and media URLs", async () => {
    const resolver = new PersonNameResolver(mockPersonRepo(persons));
    const reactionRepo = mockReactionRepo();
    const commentRepo = mockCommentRepo();
    const mediaRepo = mockMediaRepo();
    const storage = mockStorageService();

    vi.mocked(reactionRepo.getByPostId).mockResolvedValue([
      { postId: "post1", personId: "p2", emoji: "heart", createdAt: "" },
    ]);
    vi.mocked(commentRepo.getByPostId).mockResolvedValue({
      items: [{ id: "c1" }],
      cursor: undefined,
    } as any);

    const post: Post = {
      id: "post1",
      familyId: "fam-1",
      authorPersonId: "person-1",
      textContent: "Hello",
      createdAt: "2025-01-01T00:00:00Z",
      isSystemPost: false,
    };

    const result = await enrichPosts(
      [post],
      resolver,
      reactionRepo,
      commentRepo,
      mediaRepo,
      storage,
    );

    expect(result).toHaveLength(1);
    expect(result[0]!.authorName).toBe("Mickey Mouse");
    expect(result[0]!.reactionCount).toBe(1);
    expect(result[0]!.commentCount).toBe(1);
  });

  it("works without media repos", async () => {
    const resolver = new PersonNameResolver(mockPersonRepo(persons));
    const reactionRepo = mockReactionRepo();
    const commentRepo = mockCommentRepo();
    vi.mocked(reactionRepo.getByPostId).mockResolvedValue([]);
    vi.mocked(commentRepo.getByPostId).mockResolvedValue({ items: [], cursor: undefined });

    const post: Post = {
      id: "post1",
      familyId: "fam-1",
      authorPersonId: "person-1",
      textContent: "Hello",
      createdAt: "2025-01-01T00:00:00Z",
      isSystemPost: false,
    };

    const result = await enrichPosts([post], resolver, reactionRepo, commentRepo);

    expect(result[0]!.mediaUrls).toEqual([]);
  });
});

describe("enrichSinglePost", () => {
  it("enriches a single post", async () => {
    const resolver = new PersonNameResolver(mockPersonRepo(persons));
    const reactionRepo = mockReactionRepo();
    const commentRepo = mockCommentRepo();
    vi.mocked(reactionRepo.getByPostId).mockResolvedValue([]);
    vi.mocked(commentRepo.getByPostId).mockResolvedValue({ items: [], cursor: undefined });

    const post: Post = {
      id: "post1",
      familyId: "fam-1",
      authorPersonId: "person-2",
      textContent: "Hi",
      createdAt: "2025-01-01T00:00:00Z",
      isSystemPost: false,
    };

    const result = await enrichSinglePost(post, resolver, reactionRepo, commentRepo);

    expect(result.authorName).toBe("Minnie Mouse");
    expect(result.mediaUrls).toEqual([]);
  });
});

describe("enrichComments", () => {
  it("adds personName to comments", async () => {
    const resolver = new PersonNameResolver(mockPersonRepo(persons));
    const comments: TComment[] = [
      { id: "c1", postId: "post1", personId: "person-1", textContent: "Nice", createdAt: "" },
    ];

    const result = await enrichComments(comments, "fam-1", resolver);

    expect(result[0]!.personName).toBe("Mickey Mouse");
  });
});

describe("enrichReactions", () => {
  it("adds personName to reactions", async () => {
    const resolver = new PersonNameResolver(mockPersonRepo(persons));
    const reactions: Reaction[] = [
      { postId: "post1", personId: "person-2", emoji: "heart", createdAt: "" },
    ];

    const result = await enrichReactions(reactions, "fam-1", resolver);

    expect(result[0]!.personName).toBe("Minnie Mouse");
  });
});

describe("enrichEvents", () => {
  it("adds creatorName to events", async () => {
    const resolver = new PersonNameResolver(mockPersonRepo(persons));
    const events: FamilyEvent[] = [
      {
        id: "e1",
        familyId: "fam-1",
        creatorPersonId: "person-1",
        title: "Bday",
        eventType: "birthday",
        startDate: "2025-06-15",
        createdAt: "",
      },
    ];

    const result = await enrichEvents(events, resolver);

    expect(result[0]!.creatorName).toBe("Mickey Mouse");
  });
});

describe("enrichRSVPs", () => {
  it("adds personName to RSVPs", async () => {
    const resolver = new PersonNameResolver(mockPersonRepo(persons));
    const rsvps: EventRSVP[] = [
      { eventId: "e1", personId: "person-1", status: "going", updatedAt: "" },
    ];

    const result = await enrichRSVPs(rsvps, "fam-1", resolver);

    expect(result[0]!.personName).toBe("Mickey Mouse");
  });
});
