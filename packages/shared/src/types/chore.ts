export type ChoreStatus = "pending" | "completed" | "overdue";

export interface Chore {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  assigneePersonId: string;
  dueDate?: string;
  recurrenceRule?: string;
  rotationMembers?: string[];
  status: ChoreStatus;
  completedAt?: string;
  createdAt: string;
}
