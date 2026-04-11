import type { Role, ThemeName } from "@family-app/shared";

import { NotFoundError } from "../../domain/errors";
import type { IFamilyRepository } from "../../repositories/interfaces/family-repo";
import { requireRole } from "../../shared/permission-check";

interface UpdateFamilyThemeInput {
  familyId: string;
  themeName: ThemeName;
  requesterRole: Role;
}

export class UpdateFamilyTheme {
  constructor(private readonly familyRepo: IFamilyRepository) {}

  async execute(input: UpdateFamilyThemeInput): Promise<void> {
    requireRole(input.requesterRole, "admin", "change family theme");

    const family = await this.familyRepo.getById(input.familyId);
    if (family === undefined) {
      throw new NotFoundError("Family", input.familyId);
    }

    await this.familyRepo.updateTheme(input.familyId, input.themeName);
  }
}
