import type { Person, Role } from "@family-app/shared";

import type { IPersonRepository } from "../../repositories/interfaces/person-repo";
import { requireRole } from "../../shared/permission-check";

interface AddNonAppPersonInput {
  familyId: string;
  name: string;
  requesterRole: Role;
}

export class AddNonAppPerson {
  constructor(private readonly personRepo: IPersonRepository) {}

  async execute(input: AddNonAppPersonInput): Promise<Person> {
    requireRole(input.requesterRole, "admin", "add non-app family members");

    const person: Person = {
      id: crypto.randomUUID(),
      familyId: input.familyId,
      name: input.name,
      createdAt: new Date().toISOString(),
    };

    await this.personRepo.create(person);

    return person;
  }
}
