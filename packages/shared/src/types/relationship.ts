export const RELATIONSHIP_TYPES = [
  "parent-child",
  "spouse",
  "sibling",
  "in-law",
  "grandparent-grandchild",
  "uncle-aunt",
  "cousin",
  "custom",
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export type RelationshipStatus = "confirmed" | "pending";

export interface Relationship {
  id: string;
  familyId: string;
  personAId: string;
  personBId: string;
  aToBLabel: string;
  bToALabel: string;
  type: RelationshipType;
  status: RelationshipStatus;
  createdAt: string;
}
