import { describe, it, expect, vi } from "vitest";

import { ActivationGateError } from "../../../domain/errors";
import type { IMembershipRepository } from "../../../repositories/interfaces/membership-repo";
import type { ICommentRepository } from "../../../repositories/interfaces/post-repo";
import { AddComment } from "../comments";

function mockCommentRepo(): ICommentRepository {
  return { create: vi.fn(), getByPostId: vi.fn(), delete: vi.fn() };
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

describe("AddComment", () => {
  it("creates a comment when family has 2+ members", async () => {
    const commentRepo = mockCommentRepo();
    const membershipRepo = mockMembershipRepo(3);
    const useCase = new AddComment(commentRepo, membershipRepo);

    const comment = await useCase.execute({
      postId: "post-1",
      familyId: "fam-1",
      personId: "person-1",
      textContent: "Great photo!",
      requesterRole: "viewer",
    });

    expect(comment.textContent).toBe("Great photo!");
    expect(commentRepo.create).toHaveBeenCalledOnce();
  });

  it("throws ActivationGateError when family has only 1 member", async () => {
    const commentRepo = mockCommentRepo();
    const membershipRepo = mockMembershipRepo(1);
    const useCase = new AddComment(commentRepo, membershipRepo);

    await expect(
      useCase.execute({
        postId: "post-1",
        familyId: "fam-1",
        personId: "person-1",
        textContent: "Hello!",
        requesterRole: "owner",
      }),
    ).rejects.toThrow(ActivationGateError);
  });
});
