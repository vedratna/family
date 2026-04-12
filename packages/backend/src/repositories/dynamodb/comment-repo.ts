import type { Comment } from "@family-app/shared";

import type { ICommentRepository, PaginatedResult } from "../interfaces/post-repo";

import { keys } from "./keys";
import { deleteItem, putItem, queryItems } from "./operations";

export class DynamoCommentRepository implements ICommentRepository {
  async create(comment: Comment): Promise<void> {
    await putItem({
      PK: keys.post.pk(comment.postId),
      SK: keys.post.sk.comment(comment.createdAt, comment.id),
      personId: comment.personId,
      textContent: comment.textContent,
      createdAt: comment.createdAt,
      entityType: "Comment",
    });
  }

  async getByPostId(
    postId: string,
    limit: number,
    cursor?: string,
  ): Promise<PaginatedResult<Comment>> {
    const options: Parameters<typeof queryItems>[3] = {
      scanIndexForward: true,
      limit,
    };
    if (cursor !== undefined) {
      options.exclusiveStartKey = JSON.parse(
        Buffer.from(cursor, "base64").toString("utf-8"),
      ) as Record<string, string>;
    }

    const result = await queryItems("PK", keys.post.pk(postId), keys.prefix.comment, options);

    const items = result.items.map((item) => {
      const sk = item["SK"];
      const commentId = this.extractCommentIdFromSK(sk);
      return this.toComment(commentId, postId, item);
    });

    const nextCursor =
      result.lastEvaluatedKey !== undefined
        ? Buffer.from(JSON.stringify(result.lastEvaluatedKey)).toString("base64")
        : undefined;

    return { items, cursor: nextCursor };
  }

  async delete(postId: string, timestamp: string, commentId: string): Promise<void> {
    await deleteItem(keys.post.pk(postId), keys.post.sk.comment(timestamp, commentId));
  }

  private toComment(commentId: string, postId: string, item: Record<string, unknown>): Comment {
    return {
      id: commentId,
      postId,
      personId: item["personId"] as string,
      textContent: item["textContent"] as string,
      createdAt: item["createdAt"] as string,
    };
  }

  private extractCommentIdFromSK(sk: string): string {
    // SK format: COMMENT#<timestamp>#<commentId>
    const parts = sk.split("#");
    return parts[2] as string;
  }
}
