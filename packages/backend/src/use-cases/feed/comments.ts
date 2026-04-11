import type { Comment, Role } from "@family-app/shared";

import { ActivationGateError } from "../../domain/errors";
import type { IMembershipRepository } from "../../repositories/interfaces/membership-repo";
import type { ICommentRepository, PaginatedResult } from "../../repositories/interfaces/post-repo";

const MINIMUM_ACTIVE_MEMBERS = 2;
const DEFAULT_COMMENT_PAGE_SIZE = 20;

interface AddCommentInput {
  postId: string;
  familyId: string;
  personId: string;
  textContent: string;
  requesterRole: Role;
}

export class AddComment {
  constructor(
    private readonly commentRepo: ICommentRepository,
    private readonly membershipRepo: IMembershipRepository,
  ) {}

  async execute(input: AddCommentInput): Promise<Comment> {
    const memberCount = await this.membershipRepo.countActiveMembers(input.familyId);
    if (memberCount < MINIMUM_ACTIVE_MEMBERS) {
      throw new ActivationGateError();
    }

    const comment: Comment = {
      id: crypto.randomUUID(),
      postId: input.postId,
      personId: input.personId,
      textContent: input.textContent,
      createdAt: new Date().toISOString(),
    };

    await this.commentRepo.create(comment);

    return comment;
  }
}

interface GetPostCommentsInput {
  postId: string;
  limit?: number;
  cursor?: string;
}

export class GetPostComments {
  constructor(private readonly commentRepo: ICommentRepository) {}

  async execute(input: GetPostCommentsInput): Promise<PaginatedResult<Comment>> {
    const limit = input.limit ?? DEFAULT_COMMENT_PAGE_SIZE;

    return this.commentRepo.getByPostId(input.postId, limit, input.cursor);
  }
}
