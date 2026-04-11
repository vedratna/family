import type { Relationship } from "@family-app/shared";

export const MOCK_RELATIONSHIPS: Relationship[] = [
  {
    id: "rel-001", familyId: "fam-sharma-001",
    personAId: "person-grandma", personBId: "person-rajesh",
    aToBLabel: "Mother", bToALabel: "Son", type: "parent-child",
    status: "confirmed", createdAt: "2026-03-01T10:10:00Z",
  },
  {
    id: "rel-002", familyId: "fam-sharma-001",
    personAId: "person-grandma", personBId: "person-sunita",
    aToBLabel: "Mother", bToALabel: "Daughter", type: "parent-child",
    status: "confirmed", createdAt: "2026-03-01T10:11:00Z",
  },
  {
    id: "rel-003", familyId: "fam-sharma-001",
    personAId: "person-rajesh", personBId: "person-priya",
    aToBLabel: "Husband", bToALabel: "Wife", type: "spouse",
    status: "confirmed", createdAt: "2026-03-01T10:12:00Z",
  },
  {
    id: "rel-004", familyId: "fam-sharma-001",
    personAId: "person-rajesh", personBId: "person-amit",
    aToBLabel: "Father", bToALabel: "Son", type: "parent-child",
    status: "confirmed", createdAt: "2026-03-02T10:00:00Z",
  },
  {
    id: "rel-005", familyId: "fam-sharma-001",
    personAId: "person-grandma", personBId: "person-priya",
    aToBLabel: "Mother-in-law", bToALabel: "Daughter-in-law", type: "in-law",
    status: "pending", createdAt: "2026-03-01T10:15:00Z",
  },
];
