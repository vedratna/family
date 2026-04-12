import type { EventType, Role, RSVPStatus } from "@family-app/shared";
import type { AppSyncResolverEvent } from "aws-lambda";

import { DomainError } from "../../domain/errors";
import { DynamoEventRepository } from "../../repositories/dynamodb/event-repo";
import { DynamoEventRSVPRepository } from "../../repositories/dynamodb/event-rsvp-repo";
import { DynamoMembershipRepository } from "../../repositories/dynamodb/membership-repo";
import { DynamoPersonRepository } from "../../repositories/dynamodb/person-repo";
import { DynamoUserRepository } from "../../repositories/dynamodb/user-repo";
import {
  CreateEvent,
  DeleteEvent,
  EditEvent,
  GetFamilyEvents,
  RSVPEvent,
} from "../../use-cases/calendar";

const userRepo = new DynamoUserRepository();
const personRepo = new DynamoPersonRepository();
const membershipRepo = new DynamoMembershipRepository();
const eventRepo = new DynamoEventRepository();
const eventRSVPRepo = new DynamoEventRSVPRepository();

const getFamilyEvents = new GetFamilyEvents(eventRepo);
const createEvent = new CreateEvent(eventRepo);
const editEvent = new EditEvent(eventRepo);
const deleteEvent = new DeleteEvent(eventRepo);
const rsvpEvent = new RSVPEvent(eventRSVPRepo);

interface HandlerArgs {
  [key: string]: unknown;
}

export async function handler(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  try {
    const field = event.info.fieldName;
    switch (field) {
      case "familyEvents":
        return await handleFamilyEvents(event);
      case "eventDetail":
        return await handleEventDetail(event);
      case "createEvent":
        return await handleCreateEvent(event);
      case "editEvent":
        return await handleEditEvent(event);
      case "deleteEvent":
        return await handleDeleteEvent(event);
      case "rsvpEvent":
        return await handleRSVPEvent(event);
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

async function resolveRequester(
  event: AppSyncResolverEvent<HandlerArgs>,
  familyId: string,
): Promise<{ personId: string; role: Role }> {
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
  return { personId: person.id, role: membership.role };
}

async function handleFamilyEvents(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const args = event.arguments;
  const input: { familyId: string; startDate: string; endDate: string; eventType?: string } = {
    familyId: args.familyId as string,
    startDate: args.startDate as string,
    endDate: args.endDate as string,
  };
  if (typeof args.eventType === "string") {
    input.eventType = args.eventType;
  }
  return getFamilyEvents.execute(input);
}

async function handleEventDetail(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const args = event.arguments;
  return eventRepo.getById(args.familyId as string, args.date as string, args.eventId as string);
}

async function handleCreateEvent(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const args = event.arguments;
  const familyId = args.familyId as string;
  const { personId, role } = await resolveRequester(event, familyId);
  const input: Parameters<typeof createEvent.execute>[0] = {
    familyId,
    creatorPersonId: personId,
    title: args.title as string,
    eventType: args.eventType as EventType,
    startDate: args.startDate as string,
    requesterRole: role,
  };
  if (typeof args.description === "string") {
    input.description = args.description;
  }
  if (typeof args.startTime === "string") {
    input.startTime = args.startTime;
  }
  if (typeof args.location === "string") {
    input.location = args.location;
  }
  if (typeof args.recurrenceRule === "string") {
    input.recurrenceRule = args.recurrenceRule;
  }
  return createEvent.execute(input);
}

async function handleEditEvent(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const args = event.arguments;
  const familyId = args.familyId as string;
  const { role } = await resolveRequester(event, familyId);
  await editEvent.execute({
    familyId,
    eventId: args.eventId as string,
    date: args.date as string,
    updates: args.updates as Partial<
      Pick<
        import("@family-app/shared").FamilyEvent,
        "title" | "description" | "eventType" | "startDate" | "startTime" | "location"
      >
    >,
    requesterRole: role,
  });
  return true;
}

async function handleDeleteEvent(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const args = event.arguments;
  const familyId = args.familyId as string;
  const { role } = await resolveRequester(event, familyId);
  await deleteEvent.execute(familyId, args.date as string, args.eventId as string, role);
  return true;
}

async function handleRSVPEvent(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const args = event.arguments;
  const familyId = args.familyId as string;
  const { personId } = await resolveRequester(event, familyId);
  return rsvpEvent.execute({
    eventId: args.eventId as string,
    personId,
    status: args.status as RSVPStatus,
  });
}
