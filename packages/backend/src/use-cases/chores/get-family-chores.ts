import type { Chore, ChoreStatus } from "@family-app/shared";

import type { IChoreRepository } from "../../repositories/interfaces/chore-repo";

interface GetFamilyChoresInput {
  familyId: string;
  assigneePersonId?: string;
  status?: ChoreStatus;
}

export class GetFamilyChores {
  constructor(private readonly choreRepo: IChoreRepository) {}

  async execute(input: GetFamilyChoresInput): Promise<Chore[]> {
    let chores: Chore[];

    if (input.assigneePersonId !== undefined) {
      chores = await this.choreRepo.getByAssignee(input.familyId, input.assigneePersonId);
    } else {
      chores = await this.choreRepo.getByFamily(input.familyId);
    }

    if (input.status !== undefined) {
      chores = chores.filter((c) => c.status === input.status);
    }

    return chores;
  }
}
