import type { Post } from "@family-app/shared";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { NotFoundError, PermissionDeniedError } from "../../../domain/errors";
import type { IPostRepository } from "../../../repositories/interfaces/post-repo";
import { DeletePost } from "../delete-post";

function mockPostRepo(): IPostRepository {
  return { create: vi.fn(), getById: vi.fn(), getFamilyFeed: vi.fn(), delete: vi.fn() };
}

const regularPost: Post = {
  id: "post-1",
  familyId: "fam-1",
  authorPersonId: "person-1",
  textContent: "Hello!",
  isSystemPost: false,
  createdAt: "2026-04-07T10:00:00Z",
};

const systemPost: Post = {
  id: "post-sys",
  familyId: "fam-1",
  authorPersonId: "system",
  textContent: "Welcome!",
  isSystemPost: true,
  createdAt: "2026-04-07T09:00:00Z",
};

describe("DeletePost", () => {
  let postRepo: IPostRepository;
  let useCase: DeletePost;

  beforeEach(() => {
    postRepo = mockPostRepo();
    useCase = new DeletePost(postRepo);
  });

  it("allows author to delete own post", async () => {
    vi.mocked(postRepo.getById).mockResolvedValue(regularPost);

    await useCase.execute({
      familyId: "fam-1",
      postId: "post-1",
      requesterPersonId: "person-1",
      requesterRole: "editor",
    });

    expect(postRepo.delete).toHaveBeenCalledOnce();
  });

  it("allows admin to delete any post", async () => {
    vi.mocked(postRepo.getById).mockResolvedValue(regularPost);

    await useCase.execute({
      familyId: "fam-1",
      postId: "post-1",
      requesterPersonId: "person-99",
      requesterRole: "admin",
    });

    expect(postRepo.delete).toHaveBeenCalledOnce();
  });

  it("rejects non-author editor from deleting", async () => {
    vi.mocked(postRepo.getById).mockResolvedValue(regularPost);

    await expect(
      useCase.execute({
        familyId: "fam-1",
        postId: "post-1",
        requesterPersonId: "person-99",
        requesterRole: "editor",
      }),
    ).rejects.toThrow(PermissionDeniedError);
  });

  it("rejects deleting system posts", async () => {
    vi.mocked(postRepo.getById).mockResolvedValue(systemPost);

    await expect(
      useCase.execute({
        familyId: "fam-1",
        postId: "post-sys",
        requesterPersonId: "person-1",
        requesterRole: "owner",
      }),
    ).rejects.toThrow(PermissionDeniedError);
  });

  it("throws NotFoundError for nonexistent post", async () => {
    vi.mocked(postRepo.getById).mockResolvedValue(undefined);

    await expect(
      useCase.execute({
        familyId: "fam-1",
        postId: "nonexistent",
        requesterPersonId: "person-1",
        requesterRole: "owner",
      }),
    ).rejects.toThrow(NotFoundError);
  });
});
