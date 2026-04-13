import type { Post, Role } from "@family-app/shared";

import { ActivationGateError } from "../../domain/errors";
import type { IMembershipRepository } from "../../repositories/interfaces/membership-repo";
import type { IPostRepository } from "../../repositories/interfaces/post-repo";
import { requireRole } from "../../shared/permission-check";

const MINIMUM_ACTIVE_MEMBERS = 2;

interface CreatePostInput {
  familyId: string;
  authorPersonId: string;
  textContent: string;
  requesterRole: Role;
  mediaIds?: string[];
}

export class CreatePost {
  constructor(
    private readonly postRepo: IPostRepository,
    private readonly membershipRepo: IMembershipRepository,
  ) {}

  async execute(input: CreatePostInput): Promise<Post> {
    requireRole(input.requesterRole, "editor", "create posts");

    const memberCount = await this.membershipRepo.countActiveMembers(input.familyId);
    if (memberCount < MINIMUM_ACTIVE_MEMBERS) {
      throw new ActivationGateError();
    }

    const post: Post = {
      id: crypto.randomUUID(),
      familyId: input.familyId,
      authorPersonId: input.authorPersonId,
      textContent: input.textContent,
      isSystemPost: false,
      createdAt: new Date().toISOString(),
      ...(input.mediaIds !== undefined &&
        input.mediaIds.length > 0 && { mediaIds: input.mediaIds }),
    };

    await this.postRepo.create(post);

    return post;
  }
}
