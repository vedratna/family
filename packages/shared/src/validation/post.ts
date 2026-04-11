import { z } from "zod";

export const CreatePostInput = z.object({
  familyId: z.string().uuid(),
  textContent: z.string().min(1).max(5000),
  mediaKeys: z.array(z.string()).max(10).default([]),
});

export const AddCommentInput = z.object({
  postId: z.string().uuid(),
  textContent: z.string().min(1).max(2000),
});

export const AddReactionInput = z.object({
  postId: z.string().uuid(),
  emoji: z.string().min(1).max(10),
});

export type CreatePostInputType = z.infer<typeof CreatePostInput>;
export type AddCommentInputType = z.infer<typeof AddCommentInput>;
export type AddReactionInputType = z.infer<typeof AddReactionInput>;
