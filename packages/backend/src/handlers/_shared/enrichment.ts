import type { Post, Comment, Reaction, FamilyEvent, EventRSVP } from "@family-app/shared";

import type { IPersonRepository } from "../../repositories/interfaces/person-repo";
import type { ICommentRepository } from "../../repositories/interfaces/post-repo";
import type { IReactionRepository } from "../../repositories/interfaces/post-repo";

/**
 * Per-invocation cache for resolving personId → display name within a family.
 * Mirrors the local server's getPersonName helper.
 */
export class PersonNameResolver {
  private readonly cache = new Map<string, Map<string, string>>();

  constructor(private readonly personRepo: IPersonRepository) {}

  async getName(familyId: string, personId: string): Promise<string> {
    if (personId === "system") return "System";
    let famCache = this.cache.get(familyId);
    if (famCache === undefined) {
      const persons = await this.personRepo.getByFamilyId(familyId);
      famCache = new Map(persons.map((p) => [p.id, p.name]));
      this.cache.set(familyId, famCache);
    }
    return famCache.get(personId) ?? "Unknown";
  }
}

export interface EnrichedPost extends Post {
  authorName: string;
  reactionCount: number;
  commentCount: number;
}

export interface EnrichedComment extends Comment {
  personName: string;
}

export interface EnrichedReaction extends Reaction {
  personName: string;
}

export interface EnrichedEvent extends FamilyEvent {
  creatorName: string;
}

export interface EnrichedRSVP extends EventRSVP {
  personName: string;
}

export async function enrichPosts(
  posts: Post[],
  resolver: PersonNameResolver,
  reactionRepo: IReactionRepository,
  commentRepo: ICommentRepository,
): Promise<EnrichedPost[]> {
  return Promise.all(
    posts.map(async (post) => {
      const [authorName, reactions, comments] = await Promise.all([
        resolver.getName(post.familyId, post.authorPersonId),
        reactionRepo.getByPostId(post.id),
        commentRepo.getByPostId(post.id, 1000),
      ]);
      return {
        ...post,
        authorName,
        reactionCount: reactions.length,
        commentCount: comments.items.length,
      };
    }),
  );
}

export async function enrichSinglePost(
  post: Post,
  resolver: PersonNameResolver,
  reactionRepo: IReactionRepository,
  commentRepo: ICommentRepository,
): Promise<EnrichedPost> {
  const [authorName, reactions, comments] = await Promise.all([
    resolver.getName(post.familyId, post.authorPersonId),
    reactionRepo.getByPostId(post.id),
    commentRepo.getByPostId(post.id, 1000),
  ]);
  return {
    ...post,
    authorName,
    reactionCount: reactions.length,
    commentCount: comments.items.length,
  };
}

export async function enrichComments(
  comments: Comment[],
  familyId: string,
  resolver: PersonNameResolver,
): Promise<EnrichedComment[]> {
  return Promise.all(
    comments.map(async (comment) => ({
      ...comment,
      personName: await resolver.getName(familyId, comment.personId),
    })),
  );
}

export async function enrichReactions(
  reactions: Reaction[],
  familyId: string,
  resolver: PersonNameResolver,
): Promise<EnrichedReaction[]> {
  return Promise.all(
    reactions.map(async (reaction) => ({
      ...reaction,
      personName: await resolver.getName(familyId, reaction.personId),
    })),
  );
}

export async function enrichEvents(
  events: FamilyEvent[],
  resolver: PersonNameResolver,
): Promise<EnrichedEvent[]> {
  return Promise.all(
    events.map(async (event) => ({
      ...event,
      creatorName: await resolver.getName(event.familyId, event.creatorPersonId),
    })),
  );
}

export async function enrichRSVPs(
  rsvps: EventRSVP[],
  familyId: string,
  resolver: PersonNameResolver,
): Promise<EnrichedRSVP[]> {
  return Promise.all(
    rsvps.map(async (rsvp) => ({
      ...rsvp,
      personName: await resolver.getName(familyId, rsvp.personId),
    })),
  );
}
