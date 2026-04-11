import { z } from "zod";

import { ROLES } from "../types/roles";
import { THEME_NAMES } from "../types/theme";

export const CreateFamilyInput = z.object({
  name: z.string().min(1).max(100),
  themeName: z.enum(THEME_NAMES).default("teal"),
});

export const InviteMemberInput = z.object({
  familyId: z.string().uuid(),
  phone: z.string().min(8).max(20),
  name: z.string().min(1).max(100),
  relationshipToInviter: z.string().min(1).max(50),
  inverseRelationshipLabel: z.string().min(1).max(50),
  role: z.enum(ROLES).default("editor"),
});

export const UpdateMemberRoleInput = z.object({
  familyId: z.string().uuid(),
  personId: z.string().uuid(),
  role: z.enum(ROLES),
});

export const UpdateFamilyThemeInput = z.object({
  familyId: z.string().uuid(),
  themeName: z.enum(THEME_NAMES),
});

export type CreateFamilyInputType = z.infer<typeof CreateFamilyInput>;
export type InviteMemberInputType = z.infer<typeof InviteMemberInput>;
export type UpdateMemberRoleInputType = z.infer<typeof UpdateMemberRoleInput>;
export type UpdateFamilyThemeInputType = z.infer<typeof UpdateFamilyThemeInput>;
