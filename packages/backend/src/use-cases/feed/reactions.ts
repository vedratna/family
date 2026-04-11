import type { Reaction } from "@family-app/shared";

import type { IReactionRepository } from "../../repositories/interfaces/post-repo";

interface AddReactionInput {
  postId: string;
  personId: string;
  emoji: string;
}

export class AddReaction {
  constructor(private readonly reactionRepo: IReactionRepository) {}

  async execute(input: AddReactionInput): Promise<Reaction> {
    const reaction: Reaction = {
      postId: input.postId,
      personId: input.personId,
      emoji: input.emoji,
      createdAt: new Date().toISOString(),
    };

    await this.reactionRepo.add(reaction);

    return reaction;
  }
}

export class RemoveReaction {
  constructor(private readonly reactionRepo: IReactionRepository) {}

  async execute(postId: string, personId: string): Promise<void> {
    await this.reactionRepo.remove(postId, personId);
  }
}
