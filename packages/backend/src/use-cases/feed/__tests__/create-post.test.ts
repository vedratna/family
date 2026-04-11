import { describe, it, expect, vi } from "vitest";

import { ActivationGateError, PermissionDeniedError } from "../../../domain/errors";
import type { IMembershipRepository } from "../../../repositories/interfaces/membership-repo";
import type { IPostRepository } from "../../../repositories/interfaces/post-repo";
import { CreatePost } from "../create-post";

function mockPostRepo(): IPostRepository {
  return { create: vi.fn(), getById: vi.fn(), getFamilyFeed: vi.fn(), delete: vi.fn() };
}

function mockMembershipRepo(count: number): IMembershipRepository {
  return {
    create: vi.fn(),
    getByFamilyId: vi.fn(),
    getByUserId: vi.fn(),
    getByFamilyAndPerson: vi.fn(),
    updateRole: vi.fn(),
    delete: vi.fn(),
    countActiveMembers: vi.fn().mockResolvedValue(count),
  };
}

describe("CreatePost", () => {
  it("creates a post when family has 2+ members and user is editor", async () => {
    const postRepo = mockPostRepo();
    const membershipRepo = mockMembershipRepo(3);
    const useCase = new CreatePost(postRepo, membershipRepo);

    const post = await useCase.execute({
      familyId: "fam-1",
      authorPersonId: "person-1",
      textContent: "Hello family!",
      requesterRole: "editor",
    });

    expect(post.textContent).toBe("Hello family!");
    expect(post.isSystemPost).toBe(false);
    expect(postRepo.create).toHaveBeenCalledOnce();
  });

  it("throws ActivationGateError when family has only 1 member", async () => {
    const postRepo = mockPostRepo();
    const membershipRepo = mockMembershipRepo(1);
    const useCase = new CreatePost(postRepo, membershipRepo);

    await expect(
      useCase.execute({
        familyId: "fam-1",
        authorPersonId: "person-1",
        textContent: "Hello!",
        requesterRole: "owner",
      }),
    ).rejects.toThrow(ActivationGateError);

    expect(postRepo.create).not.toHaveBeenCalled();
  });

  it("throws PermissionDeniedError when viewer tries to post", async () => {
    const postRepo = mockPostRepo();
    const membershipRepo = mockMembershipRepo(5);
    const useCase = new CreatePost(postRepo, membershipRepo);

    await expect(
      useCase.execute({
        familyId: "fam-1",
        authorPersonId: "person-1",
        textContent: "Hello!",
        requesterRole: "viewer",
      }),
    ).rejects.toThrow(PermissionDeniedError);
  });
});
