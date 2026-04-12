import type { RelationshipType, Role } from "@family-app/shared";
import type { AppSyncResolverEvent } from "aws-lambda";

import { DomainError } from "../../domain/errors";
import { DynamoMembershipRepository } from "../../repositories/dynamodb/membership-repo";
import { DynamoPersonRepository } from "../../repositories/dynamodb/person-repo";
import { DynamoRelationshipRepository } from "../../repositories/dynamodb/relationship-repo";
import { DynamoUserRepository } from "../../repositories/dynamodb/user-repo";
import {
  ConfirmInference,
  CreateRelationship,
  DeleteRelationship,
  EditRelationship,
  GetRelationships,
  RejectInference,
} from "../../use-cases/relationships";

const userRepo = new DynamoUserRepository();
const personRepo = new DynamoPersonRepository();
const membershipRepo = new DynamoMembershipRepository();
const relationshipRepo = new DynamoRelationshipRepository();

const getRelationships = new GetRelationships(relationshipRepo);
const createRelationship = new CreateRelationship(relationshipRepo);
const editRelationship = new EditRelationship(relationshipRepo);
const deleteRelationship = new DeleteRelationship(relationshipRepo);
const confirmInference = new ConfirmInference(relationshipRepo);
const rejectInference = new RejectInference(relationshipRepo);

interface HandlerArgs {
  [key: string]: unknown;
}

export async function handler(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  try {
    const field = event.info.fieldName;
    switch (field) {
      case "familyRelationships":
        return await handleFamilyRelationships(event);
      case "createRelationship":
        return await handleCreateRelationship(event);
      case "editRelationship":
        return await handleEditRelationship(event);
      case "deleteRelationship":
        return await handleDeleteRelationship(event);
      case "confirmInference":
        return await handleConfirmInference(event);
      case "rejectInference":
        return await handleRejectInference(event);
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

async function handleFamilyRelationships(
  event: AppSyncResolverEvent<HandlerArgs>,
): Promise<unknown> {
  const args = event.arguments;
  return getRelationships.forFamily(args.familyId as string);
}

async function handleCreateRelationship(
  event: AppSyncResolverEvent<HandlerArgs>,
): Promise<unknown> {
  const args = event.arguments;
  const familyId = args.familyId as string;
  const role = await resolveRequesterRole(event, familyId);
  return createRelationship.execute({
    familyId,
    personAId: args.personAId as string,
    personBId: args.personBId as string,
    aToBLabel: args.aToBLabel as string,
    bToALabel: args.bToALabel as string,
    type: args.type as RelationshipType,
    requesterRole: role,
  });
}

async function handleEditRelationship(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const args = event.arguments;
  const familyId = args.familyId as string;
  const role = await resolveRequesterRole(event, familyId);
  const input: Parameters<typeof editRelationship.execute>[0] = {
    familyId,
    personAId: args.personAId as string,
    personBId: args.personBId as string,
    requesterRole: role,
  };
  if (typeof args.aToBLabel === "string") {
    input.aToBLabel = args.aToBLabel;
  }
  if (typeof args.bToALabel === "string") {
    input.bToALabel = args.bToALabel;
  }
  if (typeof args.type === "string") {
    input.type = args.type as RelationshipType;
  }
  await editRelationship.execute(input);
  return true;
}

async function handleDeleteRelationship(
  event: AppSyncResolverEvent<HandlerArgs>,
): Promise<unknown> {
  const args = event.arguments;
  const familyId = args.familyId as string;
  const role = await resolveRequesterRole(event, familyId);
  await deleteRelationship.execute(
    familyId,
    args.personAId as string,
    args.personBId as string,
    role,
  );
  return true;
}

async function handleConfirmInference(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const args = event.arguments;
  const familyId = args.familyId as string;
  const role = await resolveRequesterRole(event, familyId);
  await confirmInference.execute(
    familyId,
    args.personAId as string,
    args.personBId as string,
    role,
  );
  return true;
}

async function handleRejectInference(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const args = event.arguments;
  const familyId = args.familyId as string;
  const role = await resolveRequesterRole(event, familyId);
  await rejectInference.execute(familyId, args.personAId as string, args.personBId as string, role);
  return true;
}
