import type { Post } from "@family-app/shared";

import type { IPostRepository, PaginatedResult } from "../interfaces/post-repo";

import { keys } from "./keys";
import { deleteItem, getItem, putItem, queryItems } from "./operations";

export class DynamoPostRepository implements IPostRepository {
  async create(post: Post): Promise<void> {
    // Main item under family partition for feed queries
    await putItem({
      PK: keys.family.pk(post.familyId),
      SK: keys.family.sk.post(post.createdAt, post.id),
      textContent: post.textContent,
      authorPersonId: post.authorPersonId,
      isSystemPost: post.isSystemPost,
      createdAt: post.createdAt,
      entityType: "Post",
    });

    // Lookup item for getById (postId only)
    await putItem({
      PK: `POST#${post.id}`,
      SK: "METADATA",
      familyId: post.familyId,
      timestamp: post.createdAt,
      textContent: post.textContent,
      authorPersonId: post.authorPersonId,
      isSystemPost: post.isSystemPost,
      createdAt: post.createdAt,
      entityType: "PostLookup",
    });
  }

  async getById(postId: string): Promise<Post | undefined> {
    const lookup = await getItem(`POST#${postId}`, "METADATA");
    if (lookup === undefined) {
      return undefined;
    }
    return this.toPost(postId, lookup["familyId"] as string, lookup);
  }

  async getFamilyFeed(
    familyId: string,
    limit: number,
    cursor?: string,
  ): Promise<PaginatedResult<Post>> {
    const options: Parameters<typeof queryItems>[3] = {
      scanIndexForward: false,
      limit,
    };
    if (cursor !== undefined) {
      options.exclusiveStartKey = JSON.parse(
        Buffer.from(cursor, "base64").toString("utf-8"),
      ) as Record<string, string>;
    }

    const result = await queryItems("PK", keys.family.pk(familyId), keys.prefix.post, options);

    const items = result.items.map((item) => {
      const sk = item["SK"];
      const postId = this.extractPostIdFromSK(sk);
      return this.toPost(postId, familyId, item);
    });

    const nextCursor =
      result.lastEvaluatedKey !== undefined
        ? Buffer.from(JSON.stringify(result.lastEvaluatedKey)).toString("base64")
        : undefined;

    return { items, cursor: nextCursor };
  }

  async delete(familyId: string, timestamp: string, postId: string): Promise<void> {
    await deleteItem(keys.family.pk(familyId), keys.family.sk.post(timestamp, postId));
    await deleteItem(`POST#${postId}`, "METADATA");
  }

  private toPost(postId: string, familyId: string, item: Record<string, unknown>): Post {
    return {
      id: postId,
      familyId,
      textContent: item["textContent"] as string,
      authorPersonId: item["authorPersonId"] as string,
      isSystemPost: item["isSystemPost"] as boolean,
      createdAt: item["createdAt"] as string,
    };
  }

  private extractPostIdFromSK(sk: string): string {
    // SK format: POST#<timestamp>#<postId>
    const parts = sk.split("#");
    return parts[2] as string;
  }
}
