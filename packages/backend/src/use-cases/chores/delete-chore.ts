import type { Role } from "@family-app/shared";

import { NotFoundError } from "../../domain/errors";
import type { IChoreRepository } from "../../repositories/interfaces/chore-repo";
import { requireRole } from "../../shared/permission-check";

interface DeleteChoreInput {
  familyId: string;
  choreId: string;
  requesterRole: Role;
}

export class DeleteChore {
  constructor(private readonly choreRepo: IChoreRepository) {}

  async execute(input: DeleteChoreInput): Promise<void> {
    requireRole(input.requesterRole, "editor", "delete chores");

    const existing = await this.choreRepo.getById(input.familyId, input.choreId);
    if (existing === undefined) {
      throw new NotFoundError("Chore", input.choreId);
    }

    await this.choreRepo.delete(input.familyId, input.choreId);
  }
}
