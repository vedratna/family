import type { Reaction } from "@family-app/shared";

import type { IReactionRepository } from "../interfaces/post-repo";

import { keys } from "./keys";
import { deleteItem, putItem, queryItems } from "./operations";

export class DynamoReactionRepository implements IReactionRepository {
  async add(reaction: Reaction): Promise<void> {
    await putItem({
      PK: keys.post.pk(reaction.postId),
      SK: keys.post.sk.reaction(reaction.personId),
      emoji: reaction.emoji,
      createdAt: reaction.createdAt,
      entityType: "Reaction",
    });
  }

  async remove(postId: string, personId: string): Promise<void> {
    await deleteItem(keys.post.pk(postId), keys.post.sk.reaction(personId));
  }

  async getByPostId(postId: string): Promise<Reaction[]> {
    const result = await queryItems("PK", keys.post.pk(postId), keys.prefix.reaction);

    return result.items.map((item) => {
      const sk = item["SK"];
      const personId = sk.replace("REACTION#", "");
      return this.toReaction(postId, personId, item);
    });
  }

  private toReaction(postId: string, personId: string, item: Record<string, unknown>): Reaction {
    return {
      postId,
      personId,
      emoji: item["emoji"] as string,
      createdAt: item["createdAt"] as string,
    };
  }
}
