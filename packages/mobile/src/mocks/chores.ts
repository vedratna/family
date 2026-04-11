import type { Chore } from "@family-app/shared";

export const MOCK_CHORES: Chore[] = [
  {
    id: "chore-001",
    familyId: "fam-sharma-001",
    title: "Take out trash",
    assigneePersonId: "person-amit",
    dueDate: "2026-04-08",
    recurrenceRule: "WEEKLY",
    rotationMembers: ["person-amit", "person-rajesh", "person-priya"],
    status: "pending",
    createdAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "chore-002",
    familyId: "fam-sharma-001",
    title: "Clean garage",
    description: "Full clean including reorganizing shelves",
    assigneePersonId: "person-rajesh",
    dueDate: "2026-04-06",
    status: "completed",
    completedAt: "2026-04-06T15:00:00Z",
    createdAt: "2026-04-01T10:00:00Z",
  },
  {
    id: "chore-003",
    familyId: "fam-sharma-001",
    title: "Water the garden",
    assigneePersonId: "person-amit",
    dueDate: "2026-04-05",
    status: "overdue",
    createdAt: "2026-04-01T10:00:00Z",
  },
];
