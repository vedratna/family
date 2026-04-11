import type { Chore } from "@family-app/shared";

export interface IChoreRepository {
  create(chore: Chore): Promise<void>;
  getById(familyId: string, choreId: string): Promise<Chore | undefined>;
  getByFamily(familyId: string): Promise<Chore[]>;
  getByAssignee(familyId: string, personId: string): Promise<Chore[]>;
  update(familyId: string, choreId: string, updates: Partial<Chore>): Promise<void>;
  delete(familyId: string, choreId: string): Promise<void>;
}
