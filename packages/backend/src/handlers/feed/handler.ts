import type { Post, Comment, Reaction, Role } from "@family-app/shared";
import type { AppSyncResolverEvent } from "aws-lambda";

import { DomainError } from "../../domain/errors";
import { DynamoCommentRepository } from "../../repositories/dynamodb/comment-repo";
import { DynamoMembershipRepository } from "../../repositories/dynamodb/membership-repo";
import { DynamoPersonRepository } from "../../repositories/dynamodb/person-repo";
import { DynamoPostRepository } from "../../repositories/dynamodb/post-repo";
import { DynamoReactionRepository } from "../../repositories/dynamodb/reaction-repo";
import { DynamoUserRepository } from "../../repositories/dynamodb/user-repo";
import {
  AddComment,
  AddReaction,
  CreatePost,
  DeletePost,
  GetFamilyFeed,
  GetPostComments,
  RemoveReaction,
} from "../../use-cases/feed";
import {
  PersonNameResolver,
  enrichPosts,
  enrichSinglePost,
  enrichComments,
  enrichReactions,
} from "../_shared/enrichment";
import type { EnrichedPost, EnrichedComment, EnrichedReaction } from "../_shared/enrichment";

const userRepo = new DynamoUserRepository();
const personRepo = new DynamoPersonRepository();
const membershipRepo = new DynamoMembershipRepository();
const postRepo = new DynamoPostRepository();
const commentRepo = new DynamoCommentRepository();
const reactionRepo = new DynamoReactionRepository();

const getFamilyFeed = new GetFamilyFeed(postRepo);
const getPostComments = new GetPostComments(commentRepo);
const createPost = new CreatePost(postRepo, membershipRepo);
const deletePost = new DeletePost(postRepo);
const addReaction = new AddReaction(reactionRepo);
const removeReaction = new RemoveReaction(reactionRepo);
const addComment = new AddComment(commentRepo, membershipRepo);

interface HandlerArgs {
  [key: string]: unknown;
}

export async function handler(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  try {
    const resolver = new PersonNameResolver(personRepo);
    const field = event.info.fieldName;
    switch (field) {
      case "familyFeed":
        return await handleFamilyFeed(event, resolver);
      case "postDetail":
        return await handlePostDetail(event, resolver);
      case "postComments":
        return await handlePostComments(event, resolver);
      case "postReactions":
        return await handlePostReactions(event, resolver);
      case "createPost":
        return await handleCreatePost(event, resolver);
      case "deletePost":
        return await handleDeletePost(event);
      case "addReaction":
        return await handleAddReaction(event, resolver);
      case "removeReaction":
        return await handleRemoveReaction(event);
      case "addComment":
        return await handleAddComment(event, resolver);
      default:
        throw new Error(`Unknown field: ${field}`);
    }
  } catch (error: unknown) {
    if (error instanceof DomainError) {
      throw new Error(`${error.code}: ${error.message}`);
    }
    throw error;
  }
}

async function resolveRequester(
  event: AppSyncResolverEvent<HandlerArgs>,
  familyId: string,
): Promise<{ personId: string; role: Role }> {
  const identity = event.identity as { sub: string } | undefined;
  const cognitoSub = identity?.sub ?? "";
  const user = await userRepo.getByCognitoSub(cognitoSub);
  if (user === undefined) {
    throw new Error("USER_NOT_FOUND: No user found for this Cognito identity");
  }
  const person = await personRepo.getByUserId(familyId, user.id);
  if (person === undefined) {
    throw new Error("MEMBER_NOT_FOUND: Caller is not a member of this family");
  }
  const membership = await membershipRepo.getByFamilyAndPerson(familyId, person.id);
  if (membership === undefined) {
    throw new Error("MEMBER_NOT_FOUND: No membership found for caller");
  }
  return { personId: person.id, role: membership.role };
}

async function handleFamilyFeed(
  event: AppSyncResolverEvent<HandlerArgs>,
  resolver: PersonNameResolver,
): Promise<{ items: EnrichedPost[]; cursor: string | undefined }> {
  const args = event.arguments;
  const input: { familyId: string; limit?: number; cursor?: string } = {
    familyId: args.familyId as string,
  };
  if (typeof args.limit === "number") {
    input.limit = args.limit;
  }
  if (typeof args.cursor === "string") {
    input.cursor = args.cursor;
  }
  const result = await getFamilyFeed.execute(input);
  const enrichedItems = await enrichPosts(result.items, resolver, reactionRepo, commentRepo);
  return { items: enrichedItems, cursor: result.cursor };
}

async function handlePostDetail(
  event: AppSyncResolverEvent<HandlerArgs>,
  resolver: PersonNameResolver,
): Promise<EnrichedPost | null> {
  const args = event.arguments;
  const postId = args.postId as string;
  const post = await postRepo.getById(postId);
  if (post === undefined) {
    return null;
  }
  return enrichSinglePost(post, resolver, reactionRepo, commentRepo);
}

async function handlePostComments(
  event: AppSyncResolverEvent<HandlerArgs>,
  resolver: PersonNameResolver,
): Promise<{ items: EnrichedComment[]; cursor: string | undefined }> {
  const args = event.arguments;
  const postId = args.postId as string;
  const input: { postId: string; limit?: number; cursor?: string } = { postId };
  if (typeof args.limit === "number") {
    input.limit = args.limit;
  }
  if (typeof args.cursor === "string") {
    input.cursor = args.cursor;
  }
  const result = await getPostComments.execute(input);

  // Look up the post to get familyId for name resolution
  const post = await postRepo.getById(postId);
  const familyId = post?.familyId ?? "";
  const enrichedItems = await enrichComments(result.items, familyId, resolver);
  return { items: enrichedItems, cursor: result.cursor };
}

async function handlePostReactions(
  event: AppSyncResolverEvent<HandlerArgs>,
  resolver: PersonNameResolver,
): Promise<EnrichedReaction[]> {
  const args = event.arguments;
  const postId = args.postId as string;
  const reactions = await reactionRepo.getByPostId(postId);

  // Look up the post to get familyId for name resolution
  const post = await postRepo.getById(postId);
  const familyId = post?.familyId ?? "";
  return enrichReactions(reactions, familyId, resolver);
}

async function handleCreatePost(
  event: AppSyncResolverEvent<HandlerArgs>,
  resolver: PersonNameResolver,
): Promise<EnrichedPost> {
  const args = event.arguments;
  const familyId = args.familyId as string;
  const { personId, role } = await resolveRequester(event, familyId);
  const post: Post = await createPost.execute({
    familyId,
    authorPersonId: personId,
    textContent: args.textContent as string,
    requesterRole: role,
  });
  return enrichSinglePost(post, resolver, reactionRepo, commentRepo);
}

async function handleDeletePost(event: AppSyncResolverEvent<HandlerArgs>): Promise<boolean> {
  const args = event.arguments;
  const familyId = args.familyId as string;
  const { personId, role } = await resolveRequester(event, familyId);
  await deletePost.execute({
    familyId,
    postId: args.postId as string,
    requesterPersonId: personId,
    requesterRole: role,
  });
  return true;
}

async function handleAddReaction(
  event: AppSyncResolverEvent<HandlerArgs>,
  resolver: PersonNameResolver,
): Promise<EnrichedReaction> {
  const args = event.arguments;
  const familyId = args.familyId as string;
  const { personId } = await resolveRequester(event, familyId);
  const reaction: Reaction = await addReaction.execute({
    postId: args.postId as string,
    personId,
    emoji: args.emoji as string,
  });
  const personName = await resolver.getName(familyId, personId);
  return { ...reaction, personName };
}

async function handleRemoveReaction(event: AppSyncResolverEvent<HandlerArgs>): Promise<boolean> {
  const args = event.arguments;
  const familyId = args.familyId as string;
  const { personId } = await resolveRequester(event, familyId);
  await removeReaction.execute(args.postId as string, personId);
  return true;
}

async function handleAddComment(
  event: AppSyncResolverEvent<HandlerArgs>,
  resolver: PersonNameResolver,
): Promise<EnrichedComment> {
  const args = event.arguments;
  const familyId = args.familyId as string;
  const { personId, role } = await resolveRequester(event, familyId);
  const comment: Comment = await addComment.execute({
    postId: args.postId as string,
    familyId,
    personId,
    textContent: args.textContent as string,
    requesterRole: role,
  });
  const personName = await resolver.getName(familyId, personId);
  return { ...comment, personName };
}
