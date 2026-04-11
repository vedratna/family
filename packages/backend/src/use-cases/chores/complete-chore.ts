import { NotFoundError } from "../../domain/errors";
import type { IChoreRepository } from "../../repositories/interfaces/chore-repo";

export class CompleteChore {
  constructor(private readonly choreRepo: IChoreRepository) {}

  async execute(familyId: string, choreId: string): Promise<void> {
    const chore = await this.choreRepo.getById(familyId, choreId);
    if (chore === undefined) {
      throw new NotFoundError("Chore", choreId);
    }

    await this.choreRepo.update(familyId, choreId, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });
  }
}
