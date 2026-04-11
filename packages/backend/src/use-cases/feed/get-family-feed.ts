import type { Post } from "@family-app/shared";

import type { IPostRepository, PaginatedResult } from "../../repositories/interfaces/post-repo";

const DEFAULT_PAGE_SIZE = 20;

interface GetFamilyFeedInput {
  familyId: string;
  limit?: number;
  cursor?: string;
}

export class GetFamilyFeed {
  constructor(private readonly postRepo: IPostRepository) {}

  async execute(input: GetFamilyFeedInput): Promise<PaginatedResult<Post>> {
    const limit = input.limit ?? DEFAULT_PAGE_SIZE;

    return this.postRepo.getFamilyFeed(input.familyId, limit, input.cursor);
  }
}
