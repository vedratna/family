import { z } from "zod";

export const CreateChoreInput = z.object({
  familyId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  assigneePersonId: z.string().uuid(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  recurrenceRule: z.string().max(200).optional(),
  rotationMembers: z.array(z.string().uuid()).optional(),
});

export const CompleteChoreInput = z.object({
  choreId: z.string().uuid(),
});

export type CreateChoreInputType = z.infer<typeof CreateChoreInput>;
export type CompleteChoreInputType = z.infer<typeof CompleteChoreInput>;
