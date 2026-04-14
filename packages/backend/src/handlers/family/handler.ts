import type { Role, ThemeName } from "@family-app/shared";
import type { AppSyncResolverEvent } from "aws-lambda";

import { DomainError } from "../../domain/errors";
import { DynamoFamilyRepository } from "../../repositories/dynamodb/family-repo";
import { DynamoInvitationRepository } from "../../repositories/dynamodb/invitation-repo";
import { DynamoMembershipRepository } from "../../repositories/dynamodb/membership-repo";
import { DynamoNotificationPrefRepository } from "../../repositories/dynamodb/notification-pref-repo";
import { DynamoPersonRepository } from "../../repositories/dynamodb/person-repo";
import { S3StorageService } from "../../repositories/dynamodb/s3-storage-service";
import { DynamoUserRepository } from "../../repositories/dynamodb/user-repo";
import {
  AcceptInvitation,
  AddNonAppPerson,
  CreateFamily,
  GetUserFamilies,
  InviteMember,
  RemoveMember,
  TransferOwnership,
  UpdateFamilyTheme,
  UpdateMemberRole,
} from "../../use-cases/family";
import { resolveProfilePhotoUrl } from "../_shared/enrichment";

const userRepo = new DynamoUserRepository();
const familyRepo = new DynamoFamilyRepository();
const personRepo = new DynamoPersonRepository();
const membershipRepo = new DynamoMembershipRepository();
const invitationRepo = new DynamoInvitationRepository();
const notifPrefRepo = new DynamoNotificationPrefRepository();
const storageService = new S3StorageService();

const getUserFamilies = new GetUserFamilies(membershipRepo, familyRepo);
const createFamily = new CreateFamily(familyRepo, personRepo, membershipRepo, notifPrefRepo);
const inviteMember = new InviteMember(familyRepo, membershipRepo, invitationRepo);
const acceptInvitation = new AcceptInvitation(
  invitationRepo,
  personRepo,
  membershipRepo,
  notifPrefRepo,
);
const addNonAppPerson = new AddNonAppPerson(personRepo);
const updateMemberRole = new UpdateMemberRole(membershipRepo);
const transferOwnership = new TransferOwnership(membershipRepo);
const removeMember = new RemoveMember(membershipRepo);
const updateFamilyTheme = new UpdateFamilyTheme(familyRepo);

interface HandlerArgs {
  [key: string]: unknown;
}

export async function handler(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  try {
    const field = event.info.fieldName;
    switch (field) {
      case "myFamilies":
        return await handleMyFamilies(event);
      case "familyMembers":
        return await handleFamilyMembers(event);
      case "createFamily":
        return await handleCreateFamily(event);
      case "inviteMember":
        return await handleInviteMember(event);
      case "acceptInvitation":
        return await handleAcceptInvitation(event);
      case "addNonAppPerson":
        return await handleAddNonAppPerson(event);
      case "updateMemberRole":
        return await handleUpdateMemberRole(event);
      case "transferOwnership":
        return await handleTransferOwnership(event);
      case "removeMember":
        return await handleRemoveMember(event);
      case "updateFamilyTheme":
        return await handleUpdateFamilyTheme(event);
      case "myInvitations":
        return await handleMyInvitations(event);
      default:
        throw new Error(`Unknown field: ${field}`);
    }
  } catch (error: unknown) {
    if (error instanceof DomainError) {
      throw new Error(`${error.code}: ${error.message}`);
    }
    throw error;
  }
}

async function resolveUserId(event: AppSyncResolverEvent<HandlerArgs>): Promise<string> {
  const identity = event.identity as { sub: string } | undefined;
  const cognitoSub = identity?.sub ?? "";
  const user = await userRepo.getByCognitoSub(cognitoSub);
  if (user === undefined) {
    throw new Error("USER_NOT_FOUND: No user found for this Cognito identity");
  }
  return user.id;
}

async function resolveRequesterRole(
  familyId: string,
  userId: string,
): Promise<{ personId: string; role: Role }> {
  const person = await personRepo.getByUserId(familyId, userId);
  if (person === undefined) {
    throw new Error("MEMBER_NOT_FOUND: Caller is not a member of this family");
  }
  const membership = await membershipRepo.getByFamilyAndPerson(familyId, person.id);
  if (membership === undefined) {
    throw new Error("MEMBER_NOT_FOUND: No membership found for caller");
  }
  return { personId: person.id, role: membership.role };
}

async function handleMyFamilies(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const userId = await resolveUserId(event);
  const results = await getUserFamilies.execute(userId);
  return results.map((r) => ({
    family: r.family,
    role: r.membership.role,
    personId: r.membership.personId,
  }));
}

async function handleFamilyMembers(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const args = event.arguments;
  const familyId = args.familyId as string;
  const [memberships, persons] = await Promise.all([
    membershipRepo.getByFamilyId(familyId),
    personRepo.getByFamilyId(familyId),
  ]);
  const enrichedPersons = await Promise.all(
    persons.map(async (p) => ({
      ...p,
      profilePhotoUrl: await resolveProfilePhotoUrl(p.profilePhotoKey, storageService),
    })),
  );
  return { memberships, persons: enrichedPersons };
}

async function handleCreateFamily(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const userId = await resolveUserId(event);
  const args = event.arguments;
  return createFamily.execute({
    name: args.name as string,
    themeName: args.themeName as ThemeName,
    userId,
    displayName: args.displayName as string,
  });
}

async function handleInviteMember(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const userId = await resolveUserId(event);
  const args = event.arguments;
  const familyId = args.familyId as string;
  const { personId, role } = await resolveRequesterRole(familyId, userId);
  return inviteMember.execute({
    familyId,
    inviterPersonId: personId,
    inviterRole: role,
    phone: args.phone as string,
    name: args.name as string,
    relationshipToInviter: args.relationshipToInviter as string,
    inverseRelationshipLabel: args.inverseRelationshipLabel as string,
    role: args.role as Role,
  });
}

async function handleAcceptInvitation(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const userId = await resolveUserId(event);
  const args = event.arguments;
  return acceptInvitation.execute({
    familyId: args.familyId as string,
    phone: args.phone as string,
    userId,
    displayName: args.displayName as string,
  });
}

async function handleAddNonAppPerson(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const userId = await resolveUserId(event);
  const args = event.arguments;
  const familyId = args.familyId as string;
  const { role } = await resolveRequesterRole(familyId, userId);
  return addNonAppPerson.execute({
    familyId,
    name: args.name as string,
    requesterRole: role,
  });
}

async function handleUpdateMemberRole(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const userId = await resolveUserId(event);
  const args = event.arguments;
  const familyId = args.familyId as string;
  const { role } = await resolveRequesterRole(familyId, userId);
  await updateMemberRole.execute({
    familyId,
    targetPersonId: args.targetPersonId as string,
    newRole: args.newRole as Role,
    requesterRole: role,
  });
  return true;
}

async function handleTransferOwnership(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const userId = await resolveUserId(event);
  const args = event.arguments;
  const familyId = args.familyId as string;
  const { personId, role } = await resolveRequesterRole(familyId, userId);
  await transferOwnership.execute({
    familyId,
    currentOwnerPersonId: personId,
    newOwnerPersonId: args.newOwnerPersonId as string,
    requesterRole: role,
  });
  return true;
}

async function handleRemoveMember(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const userId = await resolveUserId(event);
  const args = event.arguments;
  const familyId = args.familyId as string;
  const { role } = await resolveRequesterRole(familyId, userId);
  await removeMember.execute({
    familyId,
    targetPersonId: args.targetPersonId as string,
    requesterRole: role,
  });
  return true;
}

async function handleUpdateFamilyTheme(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const userId = await resolveUserId(event);
  const args = event.arguments;
  const familyId = args.familyId as string;
  const { role } = await resolveRequesterRole(familyId, userId);
  await updateFamilyTheme.execute({
    familyId,
    themeName: args.themeName as ThemeName,
    requesterRole: role,
  });
  return true;
}

async function handleMyInvitations(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const identity = event.identity as { sub: string } | undefined;
  const cognitoSub = identity?.sub ?? "";
  const user = await userRepo.getByCognitoSub(cognitoSub);
  if (user === undefined) {
    return [];
  }
  const invitations = await invitationRepo.getByPhone(user.phone);
  const pending = invitations.filter((inv) => inv.status === "pending");

  const enriched = await Promise.all(
    pending.map(async (inv) => {
      const [family, inviterPerson] = await Promise.all([
        familyRepo.getById(inv.familyId),
        personRepo.getById(inv.familyId, inv.invitedBy),
      ]);
      return {
        familyId: inv.familyId,
        familyName: family?.name ?? "Unknown Family",
        familyThemeName: family?.themeName ?? "teal",
        phone: inv.phone,
        inviterName: inviterPerson?.name ?? "A family member",
        relationshipToInviter: inv.relationshipToInviter,
        role: inv.role,
        status: inv.status,
        createdAt: inv.createdAt,
      };
    }),
  );
  return enriched;
}
