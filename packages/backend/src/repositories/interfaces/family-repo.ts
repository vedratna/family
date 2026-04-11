import type { Family } from "@family-app/shared";

export interface IFamilyRepository {
  create(family: Family): Promise<void>;
  getById(familyId: string): Promise<Family | undefined>;
  updateTheme(familyId: string, themeName: Family["themeName"]): Promise<void>;
  delete(familyId: string): Promise<void>;
}
