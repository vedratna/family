import type { Relationship } from "@family-app/shared";

import type { IRelationshipRepository } from "../../repositories/interfaces/relationship-repo";

interface PerspectiveRelationship {
  relationship: Relationship;
  label: string;
  otherPersonId: string;
}

export class GetRelationships {
  constructor(private readonly relationshipRepo: IRelationshipRepository) {}

  async forPerson(familyId: string, personId: string): Promise<PerspectiveRelationship[]> {
    const relationships = await this.relationshipRepo.getByPerson(familyId, personId);

    return relationships.map((rel) => {
      const isPersonA = rel.personAId === personId;
      return {
        relationship: rel,
        label: isPersonA ? rel.bToALabel : rel.aToBLabel,
        otherPersonId: isPersonA ? rel.personBId : rel.personAId,
      };
    });
  }

  async forFamily(familyId: string): Promise<Relationship[]> {
    return this.relationshipRepo.getByFamily(familyId);
  }
}
