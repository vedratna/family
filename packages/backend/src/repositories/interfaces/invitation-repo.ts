import type { Invitation } from "@family-app/shared";

export interface IInvitationRepository {
  create(invitation: Invitation): Promise<void>;
  getByFamilyAndPhone(familyId: string, phone: string): Promise<Invitation | undefined>;
  getByPhone(phone: string): Promise<Invitation[]>;
  updateStatus(familyId: string, phone: string, status: Invitation["status"]): Promise<void>;
}
