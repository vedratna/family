import type { Chore, Role } from "@family-app/shared";

import type { IChoreRepository } from "../../repositories/interfaces/chore-repo";
import { requireRole } from "../../shared/permission-check";

interface CreateChoreInput {
  familyId: string;
  title: string;
  description?: string;
  assigneePersonId: string;
  dueDate?: string;
  recurrenceRule?: string;
  rotationMembers?: string[];
  requesterRole: Role;
}

export class CreateChore {
  constructor(private readonly choreRepo: IChoreRepository) {}

  async execute(input: CreateChoreInput): Promise<Chore> {
    requireRole(input.requesterRole, "editor", "create chores");

    const chore: Chore = {
      id: crypto.randomUUID(),
      familyId: input.familyId,
      title: input.title,
      assigneePersonId: input.assigneePersonId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    if (input.description !== undefined) {
      chore.description = input.description;
    }
    if (input.dueDate !== undefined) {
      chore.dueDate = input.dueDate;
    }
    if (input.recurrenceRule !== undefined) {
      chore.recurrenceRule = input.recurrenceRule;
    }
    if (input.rotationMembers !== undefined) {
      chore.rotationMembers = input.rotationMembers;
    }

    await this.choreRepo.create(chore);

    return chore;
  }
}
