import type { Post, Comment, Reaction } from "@family-app/shared";

export interface PaginatedResult<T> {
  items: T[];
  cursor: string | undefined;
}

export interface IPostRepository {
  create(post: Post): Promise<void>;
  getById(postId: string): Promise<Post | undefined>;
  getFamilyFeed(familyId: string, limit: number, cursor?: string): Promise<PaginatedResult<Post>>;
  delete(familyId: string, timestamp: string, postId: string): Promise<void>;
}

export interface ICommentRepository {
  create(comment: Comment): Promise<void>;
  getByPostId(postId: string, limit: number, cursor?: string): Promise<PaginatedResult<Comment>>;
  delete(postId: string, timestamp: string, commentId: string): Promise<void>;
}

export interface IReactionRepository {
  add(reaction: Reaction): Promise<void>;
  remove(postId: string, personId: string): Promise<void>;
  getByPostId(postId: string): Promise<Reaction[]>;
}
