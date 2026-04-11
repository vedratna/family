import type { Family, Person, FamilyMembership } from "@family-app/shared";

export const MOCK_FAMILIES: Family[] = [
  {
    id: "fam-sharma-001",
    name: "Sharma Family",
    createdBy: "user-priya",
    themeName: "teal",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "fam-verma-001",
    name: "Verma Family",
    createdBy: "user-priya",
    themeName: "coral",
    createdAt: "2026-03-15T10:00:00Z",
  },
];

export const MOCK_PERSONS: Person[] = [
  {
    id: "person-grandma",
    familyId: "fam-sharma-001",
    userId: "user-grandma",
    name: "Grandma Sharma",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "person-rajesh",
    familyId: "fam-sharma-001",
    userId: "user-rajesh",
    name: "Rajesh Sharma",
    createdAt: "2026-03-01T10:01:00Z",
  },
  {
    id: "person-priya",
    familyId: "fam-sharma-001",
    userId: "user-priya",
    name: "Priya Sharma",
    createdAt: "2026-03-01T10:02:00Z",
  },
  {
    id: "person-amit",
    familyId: "fam-sharma-001",
    userId: "user-amit",
    name: "Amit Sharma",
    createdAt: "2026-03-02T10:00:00Z",
  },
  {
    id: "person-sunita",
    familyId: "fam-sharma-001",
    name: "Sunita Sharma",
    createdAt: "2026-03-01T10:03:00Z",
  },
  {
    id: "person-priya-v",
    familyId: "fam-verma-001",
    userId: "user-priya",
    name: "Priya Verma",
    createdAt: "2026-03-15T10:00:00Z",
  },
];

export const MOCK_MEMBERSHIPS: FamilyMembership[] = [
  {
    familyId: "fam-sharma-001",
    personId: "person-priya",
    userId: "user-priya",
    role: "owner",
    joinedAt: "2026-03-01T10:00:00Z",
  },
  {
    familyId: "fam-sharma-001",
    personId: "person-rajesh",
    userId: "user-rajesh",
    role: "admin",
    joinedAt: "2026-03-01T12:00:00Z",
  },
  {
    familyId: "fam-sharma-001",
    personId: "person-amit",
    userId: "user-amit",
    role: "editor",
    joinedAt: "2026-03-02T10:00:00Z",
  },
  {
    familyId: "fam-verma-001",
    personId: "person-priya-v",
    userId: "user-priya",
    role: "editor",
    joinedAt: "2026-03-15T10:00:00Z",
  },
];
