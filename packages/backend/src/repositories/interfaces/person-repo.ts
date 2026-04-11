import type { Person } from "@family-app/shared";

export interface IPersonRepository {
  create(person: Person): Promise<void>;
  getById(familyId: string, personId: string): Promise<Person | undefined>;
  getByFamilyId(familyId: string): Promise<Person[]>;
  getByUserId(familyId: string, userId: string): Promise<Person | undefined>;
  update(
    familyId: string,
    personId: string,
    updates: Partial<Pick<Person, "name" | "profilePhotoKey">>,
  ): Promise<void>;
  delete(familyId: string, personId: string): Promise<void>;
}
