import type { FamilyMembership } from "@family-app/shared";

export interface IMembershipRepository {
  create(membership: FamilyMembership): Promise<void>;
  getByFamilyId(familyId: string): Promise<FamilyMembership[]>;
  getByUserId(userId: string): Promise<FamilyMembership[]>;
  getByFamilyAndPerson(familyId: string, personId: string): Promise<FamilyMembership | undefined>;
  updateRole(familyId: string, personId: string, role: FamilyMembership["role"]): Promise<void>;
  delete(familyId: string, personId: string): Promise<void>;
  countActiveMembers(familyId: string): Promise<number>;
}
