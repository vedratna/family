import type { Chore } from "@family-app/shared";

import { NotFoundError } from "../../domain/errors";
import type { IChoreRepository } from "../../repositories/interfaces/chore-repo";

/**
 * Rotates a chore assignment to the next member in the rotation list.
 * Called by a scheduled Lambda.
 */
export class RotateChore {
  constructor(private readonly choreRepo: IChoreRepository) {}

  async execute(familyId: string, choreId: string): Promise<string> {
    const chore = await this.choreRepo.getById(familyId, choreId);
    if (chore === undefined) {
      throw new NotFoundError("Chore", choreId);
    }

    if (chore.rotationMembers === undefined || chore.rotationMembers.length === 0) {
      return chore.assigneePersonId;
    }

    const currentIndex = chore.rotationMembers.indexOf(chore.assigneePersonId);
    const nextIndex = (currentIndex + 1) % chore.rotationMembers.length;
    const nextAssignee = chore.rotationMembers[nextIndex];

    if (nextAssignee === undefined) {
      return chore.assigneePersonId;
    }

    // Reset chore to pending for next assignee
    const updates: Partial<Chore> = {
      assigneePersonId: nextAssignee,
      status: "pending",
    };
    await this.choreRepo.update(familyId, choreId, updates);

    return nextAssignee;
  }
}
