import type { ChoreStatus, Role } from "@family-app/shared";
import type { AppSyncResolverEvent } from "aws-lambda";

import { DomainError } from "../../domain/errors";
import { DynamoChoreRepository } from "../../repositories/dynamodb/chore-repo";
import { DynamoMembershipRepository } from "../../repositories/dynamodb/membership-repo";
import { DynamoPersonRepository } from "../../repositories/dynamodb/person-repo";
import { DynamoUserRepository } from "../../repositories/dynamodb/user-repo";
import {
  CompleteChore,
  CreateChore,
  DeleteChore,
  GetFamilyChores,
  RotateChore,
} from "../../use-cases/chores";

const userRepo = new DynamoUserRepository();
const personRepo = new DynamoPersonRepository();
const membershipRepo = new DynamoMembershipRepository();
const choreRepo = new DynamoChoreRepository();

const getFamilyChores = new GetFamilyChores(choreRepo);
const createChore = new CreateChore(choreRepo);
const completeChore = new CompleteChore(choreRepo);
const deleteChore = new DeleteChore(choreRepo);
const rotateChore = new RotateChore(choreRepo);

interface HandlerArgs {
  [key: string]: unknown;
}

export async function handler(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  try {
    const field = event.info.fieldName;
    switch (field) {
      case "familyChores":
        return await handleFamilyChores(event);
      case "createChore":
        return await handleCreateChore(event);
      case "completeChore":
        return await handleCompleteChore(event);
      case "deleteChore":
        return await handleDeleteChore(event);
      case "rotateChore":
        return await handleRotateChore(event);
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

async function resolveRequesterRole(
  event: AppSyncResolverEvent<HandlerArgs>,
  familyId: string,
): Promise<Role> {
  const identity = event.identity as { sub: string } | undefined;
  const cognitoSub = identity?.sub ?? "";
  const user = await userRepo.getByCognitoSub(cognitoSub);
  if (user === undefined) {
    throw new Error("USER_NOT_FOUND: No user found for this Cognito identity");
  }
  const person = await personRepo.getByUserId(familyId, user.id);
  if (person === undefined) {
    throw new Error("MEMBER_NOT_FOUND: Caller is not a member of this family");
  }
  const membership = await membershipRepo.getByFamilyAndPerson(familyId, person.id);
  if (membership === undefined) {
    throw new Error("MEMBER_NOT_FOUND: No membership found for caller");
  }
  return membership.role;
}

async function handleFamilyChores(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const args = event.arguments;
  const input: { familyId: string; assigneePersonId?: string; status?: ChoreStatus } = {
    familyId: args.familyId as string,
  };
  if (typeof args.assigneePersonId === "string") {
    input.assigneePersonId = args.assigneePersonId;
  }
  if (typeof args.status === "string") {
    input.status = args.status as ChoreStatus;
  }
  return getFamilyChores.execute(input);
}

async function handleCreateChore(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const args = event.arguments;
  const familyId = args.familyId as string;
  const role = await resolveRequesterRole(event, familyId);
  const input: Parameters<typeof createChore.execute>[0] = {
    familyId,
    title: args.title as string,
    assigneePersonId: args.assigneePersonId as string,
    requesterRole: role,
  };
  if (typeof args.description === "string") {
    input.description = args.description;
  }
  if (typeof args.dueDate === "string") {
    input.dueDate = args.dueDate;
  }
  if (typeof args.recurrenceRule === "string") {
    input.recurrenceRule = args.recurrenceRule;
  }
  if (Array.isArray(args.rotationMembers)) {
    input.rotationMembers = args.rotationMembers as string[];
  }
  return createChore.execute(input);
}

async function handleCompleteChore(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const args = event.arguments;
  const familyId = args.familyId as string;
  await resolveRequesterRole(event, familyId);
  await completeChore.execute(familyId, args.choreId as string);
  return true;
}

async function handleDeleteChore(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const args = event.arguments;
  const familyId = args.familyId as string;
  const role = await resolveRequesterRole(event, familyId);
  await deleteChore.execute({
    familyId,
    choreId: args.choreId as string,
    requesterRole: role,
  });
  return true;
}

async function handleRotateChore(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const args = event.arguments;
  return rotateChore.execute(args.familyId as string, args.choreId as string);
}
