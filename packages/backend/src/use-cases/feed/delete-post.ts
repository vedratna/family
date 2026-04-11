import type { Role } from "@family-app/shared";

import { NotFoundError, PermissionDeniedError } from "../../domain/errors";
import type { IPostRepository } from "../../repositories/interfaces/post-repo";

interface DeletePostInput {
  familyId: string;
  postId: string;
  requesterPersonId: string;
  requesterRole: Role;
}

export class DeletePost {
  constructor(private readonly postRepo: IPostRepository) {}

  async execute(input: DeletePostInput): Promise<void> {
    const post = await this.postRepo.getById(input.postId);
    if (post === undefined) {
      throw new NotFoundError("Post", input.postId);
    }

    if (post.isSystemPost) {
      throw new PermissionDeniedError("System posts cannot be deleted.");
    }

    const isAuthor = post.authorPersonId === input.requesterPersonId;
    const isAdminOrOwner = input.requesterRole === "admin" || input.requesterRole === "owner";

    if (!isAuthor && !isAdminOrOwner) {
      throw new PermissionDeniedError("Only the author, admin, or owner can delete this post.");
    }

    await this.postRepo.delete(input.familyId, post.createdAt, post.id);
  }
}
