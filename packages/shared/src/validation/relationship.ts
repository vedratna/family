import { z } from "zod";

import { RELATIONSHIP_TYPES } from "../types/relationship";

export const CreateRelationshipInput = z.object({
  familyId: z.string().uuid(),
  personAId: z.string().uuid(),
  personBId: z.string().uuid(),
  aToBLabel: z.string().min(1).max(50),
  bToALabel: z.string().min(1).max(50),
  type: z.enum(RELATIONSHIP_TYPES),
});

export const EditRelationshipInput = z.object({
  relationshipId: z.string().uuid(),
  aToBLabel: z.string().min(1).max(50).optional(),
  bToALabel: z.string().min(1).max(50).optional(),
  type: z.enum(RELATIONSHIP_TYPES).optional(),
});

export type CreateRelationshipInputType = z.infer<typeof CreateRelationshipInput>;
export type EditRelationshipInputType = z.infer<typeof EditRelationshipInput>;
