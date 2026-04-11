import type { Relationship } from "@family-app/shared";

export interface IRelationshipRepository {
  create(relationship: Relationship): Promise<void>;
  getByFamily(familyId: string): Promise<Relationship[]>;
  getByPerson(familyId: string, personId: string): Promise<Relationship[]>;
  getById(familyId: string, personAId: string, personBId: string): Promise<Relationship | undefined>;
  update(
    familyId: string,
    personAId: string,
    personBId: string,
    updates: Partial<Pick<Relationship, "aToBLabel" | "bToALabel" | "type" | "status">>,
  ): Promise<void>;
  delete(familyId: string, personAId: string, personBId: string): Promise<void>;
  getPending(familyId: string): Promise<Relationship[]>;
}
