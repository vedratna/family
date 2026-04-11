import type { Role } from "./roles";
import type { ThemeName } from "./theme";

export interface Family {
  id: string;
  name: string;
  createdBy: string;
  themeName: ThemeName;
  createdAt: string;
}

export interface Person {
  id: string;
  familyId: string;
  userId?: string;
  name: string;
  profilePhotoKey?: string;
  createdAt: string;
}

export interface FamilyMembership {
  familyId: string;
  personId: string;
  userId: string;
  role: Role;
  joinedAt: string;
}

export type InvitationStatus = "pending" | "accepted" | "expired";

export interface Invitation {
  familyId: string;
  phone: string;
  invitedBy: string;
  relationshipToInviter: string;
  inverseRelationshipLabel: string;
  role: Role;
  status: InvitationStatus;
  createdAt: string;
}
