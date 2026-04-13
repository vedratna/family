import { readFileSync } from "fs";
import { resolve } from "path";

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import type {
  EventType,
  FamilyEvent,
  MediaType,
  NotificationCategory,
  RelationshipType,
  Role,
  RSVPStatus,
  ThemeName,
} from "@family-app/shared";

import { DynamoChoreRepository } from "../repositories/dynamodb/chore-repo";
import { DynamoCommentRepository } from "../repositories/dynamodb/comment-repo";
import { DynamoDeviceTokenRepository } from "../repositories/dynamodb/device-token-repo";
import { DynamoEventRepository } from "../repositories/dynamodb/event-repo";
import { DynamoEventRSVPRepository } from "../repositories/dynamodb/event-rsvp-repo";
import { DynamoFamilyRepository } from "../repositories/dynamodb/family-repo";
import { DynamoInvitationRepository } from "../repositories/dynamodb/invitation-repo";
import { DynamoMediaRepository } from "../repositories/dynamodb/media-repo";
import { DynamoMembershipRepository } from "../repositories/dynamodb/membership-repo";
import { DynamoNotificationPrefRepository } from "../repositories/dynamodb/notification-pref-repo";
import { DynamoPersonRepository } from "../repositories/dynamodb/person-repo";
import { DynamoPostRepository } from "../repositories/dynamodb/post-repo";
import { DynamoReactionRepository } from "../repositories/dynamodb/reaction-repo";
import { DynamoRelationshipRepository } from "../repositories/dynamodb/relationship-repo";
import { S3StorageService } from "../repositories/dynamodb/s3-storage-service";
import { DynamoUserRepository } from "../repositories/dynamodb/user-repo";
import { RegisterWithPhone, UpdateUserProfile } from "../use-cases/auth";
import {
  CreateEvent,
  DeleteEvent,
  EditEvent,
  GetFamilyEvents,
  RSVPEvent,
} from "../use-cases/calendar";
import { CompleteChore, CreateChore, GetFamilyChores, RotateChore } from "../use-cases/chores";
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
} from "../use-cases/family";
import {
  AddComment,
  AddReaction,
  CreatePost,
  DeletePost,
  GetFamilyFeed,
  GetPostComments,
  RemoveReaction,
} from "../use-cases/feed";
import { ConfirmMediaUpload, GenerateUploadUrl } from "../use-cases/media";
import {
  GetNotificationPreferences,
  RegisterDeviceToken,
  UpdateNotificationPreference,
} from "../use-cases/notifications";
import {
  ConfirmInference,
  CreateRelationship,
  DeleteRelationship,
  EditRelationship,
  GetRelationships,
  RejectInference,
} from "../use-cases/relationships";
import { BuildFamilyTree, serializeTree } from "../use-cases/tree";

// ─── Context ───

interface Context {
  userId: string;
}

// ─── Repositories ───

const userRepo = new DynamoUserRepository();
const familyRepo = new DynamoFamilyRepository();
const personRepo = new DynamoPersonRepository();
const membershipRepo = new DynamoMembershipRepository();
const invitationRepo = new DynamoInvitationRepository();
const postRepo = new DynamoPostRepository();
const commentRepo = new DynamoCommentRepository();
const reactionRepo = new DynamoReactionRepository();
const eventRepo = new DynamoEventRepository();
const eventRSVPRepo = new DynamoEventRSVPRepository();
const choreRepo = new DynamoChoreRepository();
const relationshipRepo = new DynamoRelationshipRepository();
const mediaRepo = new DynamoMediaRepository();
const storageService = new S3StorageService();
const prefRepo = new DynamoNotificationPrefRepository();
const deviceTokenRepo = new DynamoDeviceTokenRepository();

// ─── Use Cases ───

const registerUseCase = new RegisterWithPhone(userRepo);
const updateProfileUseCase = new UpdateUserProfile(userRepo);

const getUserFamilies = new GetUserFamilies(membershipRepo, familyRepo);
const createFamily = new CreateFamily(familyRepo, personRepo, membershipRepo);
const inviteMember = new InviteMember(familyRepo, membershipRepo, invitationRepo);
const acceptInvitation = new AcceptInvitation(invitationRepo, personRepo, membershipRepo);
const addNonAppPerson = new AddNonAppPerson(personRepo);
const updateMemberRole = new UpdateMemberRole(membershipRepo);
const transferOwnership = new TransferOwnership(membershipRepo);
const removeMember = new RemoveMember(membershipRepo);
const updateFamilyTheme = new UpdateFamilyTheme(familyRepo);

const getFamilyFeed = new GetFamilyFeed(postRepo);
const getPostComments = new GetPostComments(commentRepo);
const createPost = new CreatePost(postRepo, membershipRepo);
const deletePost = new DeletePost(postRepo);
const addReaction = new AddReaction(reactionRepo);
const removeReaction = new RemoveReaction(reactionRepo);
const addComment = new AddComment(commentRepo, membershipRepo);

const getFamilyEvents = new GetFamilyEvents(eventRepo);
const createEvent = new CreateEvent(eventRepo);
const editEvent = new EditEvent(eventRepo);
const deleteEvent = new DeleteEvent(eventRepo);
const rsvpEvent = new RSVPEvent(eventRSVPRepo);

const getFamilyChores = new GetFamilyChores(choreRepo);
const createChore = new CreateChore(choreRepo);
const completeChore = new CompleteChore(choreRepo);
const rotateChore = new RotateChore(choreRepo);

const getRelationships = new GetRelationships(relationshipRepo);
const createRelationship = new CreateRelationship(relationshipRepo);
const editRelationship = new EditRelationship(relationshipRepo);
const deleteRelationship = new DeleteRelationship(relationshipRepo);
const confirmInference = new ConfirmInference(relationshipRepo);
const rejectInference = new RejectInference(relationshipRepo);

const buildFamilyTree = new BuildFamilyTree(personRepo, relationshipRepo);

const generateUploadUrl = new GenerateUploadUrl(storageService);
const confirmMediaUpload = new ConfirmMediaUpload(mediaRepo);

const getNotificationPreferences = new GetNotificationPreferences(prefRepo);
const updateNotificationPreference = new UpdateNotificationPreference(prefRepo);
const registerDeviceToken = new RegisterDeviceToken(deviceTokenRepo);

// ─── Helpers ───

const PORT = Number(process.env["PORT"] ?? "4000");

const typeDefs = readFileSync(resolve(__dirname, "../../../infra/graphql/schema.graphql"), "utf-8");

async function resolveUserId(ctx: Context): Promise<string> {
  const user = await userRepo.getByCognitoSub(ctx.userId);
  if (user === undefined) {
    throw new Error("USER_NOT_FOUND: No user found for this Cognito identity");
  }
  return user.id;
}

async function resolveRequester(
  ctx: Context,
  familyId: string,
): Promise<{ personId: string; role: Role }> {
  const userId = await resolveUserId(ctx);
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

// ─── Resolvers ───

const resolvers = {
  Query: {
    health: () => "OK",

    // Auth
    myFamilies: async (_: unknown, __: unknown, ctx: Context) => {
      const userId = await resolveUserId(ctx);
      return getUserFamilies.execute(userId);
    },

    // Family
    familyMembers: async (_: unknown, args: { familyId: string }) => {
      const [memberships, persons] = await Promise.all([
        membershipRepo.getByFamilyId(args.familyId),
        personRepo.getByFamilyId(args.familyId),
      ]);
      const personMap = new Map(persons.map((p) => [p.id, p]));
      return memberships.map((m) => ({
        person: personMap.get(m.personId),
        role: m.role,
        joinedAt: m.joinedAt,
        hasAppAccount: typeof m.userId === "string" && m.userId !== "",
      }));
    },

    // Feed
    familyFeed: async (_: unknown, args: { familyId: string; limit?: number; cursor?: string }) => {
      return getFamilyFeed.execute({
        familyId: args.familyId,
        ...(args.limit !== undefined && { limit: args.limit }),
        ...(args.cursor !== undefined && { cursor: args.cursor }),
      });
    },

    postDetail: async (_: unknown, args: { postId: string; familyId: string }) => {
      const result = await getFamilyFeed.execute({ familyId: args.familyId, limit: 100 });
      return result.items.find((p: { id: string }) => p.id === args.postId) ?? null;
    },

    postComments: async (_: unknown, args: { postId: string; limit?: number; cursor?: string }) => {
      return getPostComments.execute({
        postId: args.postId,
        ...(args.limit !== undefined && { limit: args.limit }),
        ...(args.cursor !== undefined && { cursor: args.cursor }),
      });
    },

    postReactions: async (_: unknown, args: { postId: string }) => {
      return reactionRepo.getByPostId(args.postId);
    },

    // Calendar
    familyEvents: async (
      _: unknown,
      args: { familyId: string; startDate: string; endDate: string },
    ) => {
      return getFamilyEvents.execute({
        familyId: args.familyId,
        startDate: args.startDate,
        endDate: args.endDate,
      });
    },

    eventDetail: async (_: unknown, args: { familyId: string; date: string; eventId: string }) => {
      return eventRepo.getById(args.familyId, args.date, args.eventId);
    },

    eventRSVPs: async (_: unknown, args: { eventId: string }) => {
      return eventRSVPRepo.getByEvent(args.eventId);
    },

    // Chores
    familyChores: async (_: unknown, args: { familyId: string }) => {
      return getFamilyChores.execute({ familyId: args.familyId });
    },

    // Relationships & Tree
    familyRelationships: async (_: unknown, args: { familyId: string }) => {
      return getRelationships.forFamily(args.familyId);
    },

    familyTree: async (_: unknown, args: { familyId: string }) => {
      const tree = await buildFamilyTree.execute(args.familyId);
      return serializeTree(tree);
    },

    // User lookup
    userByPhone: async (_: unknown, args: { phone: string }) => {
      const user = await userRepo.getByPhone(args.phone);
      return user ?? null;
    },

    // Notifications
    notificationPreferences: async (_: unknown, args: { familyId: string }, ctx: Context) => {
      const userId = await resolveUserId(ctx);
      return getNotificationPreferences.execute(userId, args.familyId);
    },
  },

  Mutation: {
    // Auth
    register: async (
      _: unknown,
      args: { phone: string; cognitoSub: string; displayName: string },
    ) => {
      const result = await registerUseCase.execute({
        phone: args.phone,
        cognitoSub: args.cognitoSub,
        displayName: args.displayName,
      });
      return result.user;
    },

    updateProfile: async (
      _: unknown,
      args: { displayName: string; profilePhotoKey?: string; dateOfBirth?: string },
      ctx: Context,
    ) => {
      const userId = await resolveUserId(ctx);
      const result = await updateProfileUseCase.execute({
        userId,
        profile: {
          displayName: args.displayName,
          ...(args.profilePhotoKey !== undefined && { profilePhotoKey: args.profilePhotoKey }),
          ...(args.dateOfBirth !== undefined && { dateOfBirth: args.dateOfBirth }),
        },
      });
      return result.user;
    },

    // Family
    createFamily: async (_: unknown, args: { name: string; themeName: string }, ctx: Context) => {
      const userId = await resolveUserId(ctx);
      const user = await userRepo.getByCognitoSub(ctx.userId);
      return createFamily.execute({
        name: args.name,
        themeName: args.themeName as ThemeName,
        userId,
        displayName: user?.displayName ?? "",
      });
    },

    inviteMember: async (
      _: unknown,
      args: {
        input: {
          familyId: string;
          phone: string;
          name: string;
          relationshipToInviter: string;
          inverseRelationshipLabel: string;
          role: string;
        };
      },
      ctx: Context,
    ) => {
      await resolveUserId(ctx);
      const { personId, role } = await resolveRequester(ctx, args.input.familyId);
      return inviteMember.execute({
        familyId: args.input.familyId,
        inviterPersonId: personId,
        inviterRole: role,
        phone: args.input.phone,
        name: args.input.name,
        relationshipToInviter: args.input.relationshipToInviter,
        inverseRelationshipLabel: args.input.inverseRelationshipLabel,
        role: args.input.role as Role,
      });
    },

    acceptInvitation: async (
      _: unknown,
      args: { familyId: string; phone: string; displayName: string },
      ctx: Context,
    ) => {
      const userId = await resolveUserId(ctx);
      return acceptInvitation.execute({
        familyId: args.familyId,
        phone: args.phone,
        userId,
        displayName: args.displayName,
      });
    },

    addNonAppPerson: async (_: unknown, args: { familyId: string; name: string }, ctx: Context) => {
      const { role } = await resolveRequester(ctx, args.familyId);
      return addNonAppPerson.execute({
        familyId: args.familyId,
        name: args.name,
        requesterRole: role,
      });
    },

    updateMemberRole: async (
      _: unknown,
      args: { familyId: string; personId: string; role: string },
      ctx: Context,
    ) => {
      const { role } = await resolveRequester(ctx, args.familyId);
      await updateMemberRole.execute({
        familyId: args.familyId,
        targetPersonId: args.personId,
        newRole: args.role as Role,
        requesterRole: role,
      });
      return true;
    },

    transferOwnership: async (
      _: unknown,
      args: { familyId: string; newOwnerPersonId: string },
      ctx: Context,
    ) => {
      const { personId, role } = await resolveRequester(ctx, args.familyId);
      await transferOwnership.execute({
        familyId: args.familyId,
        currentOwnerPersonId: personId,
        newOwnerPersonId: args.newOwnerPersonId,
        requesterRole: role,
      });
      return true;
    },

    removeMember: async (
      _: unknown,
      args: { familyId: string; personId: string },
      ctx: Context,
    ) => {
      const { role } = await resolveRequester(ctx, args.familyId);
      await removeMember.execute({
        familyId: args.familyId,
        targetPersonId: args.personId,
        requesterRole: role,
      });
      return true;
    },

    updateFamilyTheme: async (
      _: unknown,
      args: { familyId: string; themeName: string },
      ctx: Context,
    ) => {
      const { role } = await resolveRequester(ctx, args.familyId);
      await updateFamilyTheme.execute({
        familyId: args.familyId,
        themeName: args.themeName as ThemeName,
        requesterRole: role,
      });
      return true;
    },

    // Feed
    createPost: async (
      _: unknown,
      args: { input: { familyId: string; textContent: string } },
      ctx: Context,
    ) => {
      const { personId, role } = await resolveRequester(ctx, args.input.familyId);
      return createPost.execute({
        familyId: args.input.familyId,
        authorPersonId: personId,
        textContent: args.input.textContent,
        requesterRole: role,
      });
    },

    deletePost: async (_: unknown, args: { familyId: string; postId: string }, ctx: Context) => {
      const { personId, role } = await resolveRequester(ctx, args.familyId);
      await deletePost.execute({
        familyId: args.familyId,
        postId: args.postId,
        requesterPersonId: personId,
        requesterRole: role,
      });
      return true;
    },

    addReaction: async (_: unknown, args: { postId: string; emoji: string }, ctx: Context) => {
      return addReaction.execute({
        postId: args.postId,
        personId: ctx.userId,
        emoji: args.emoji,
      });
    },

    removeReaction: async (_: unknown, args: { postId: string }, ctx: Context) => {
      await removeReaction.execute(args.postId, ctx.userId);
      return true;
    },

    addComment: async (
      _: unknown,
      args: { input: { postId: string; familyId: string; textContent: string } },
      ctx: Context,
    ) => {
      const { personId, role } = await resolveRequester(ctx, args.input.familyId);
      return addComment.execute({
        postId: args.input.postId,
        familyId: args.input.familyId,
        personId,
        textContent: args.input.textContent,
        requesterRole: role,
      });
    },

    // Calendar
    createEvent: async (
      _: unknown,
      args: {
        input: {
          familyId: string;
          title: string;
          description?: string;
          eventType: string;
          startDate: string;
          startTime?: string;
          location?: string;
          recurrenceRule?: string;
        };
      },
      ctx: Context,
    ) => {
      const { personId, role } = await resolveRequester(ctx, args.input.familyId);
      return createEvent.execute({
        familyId: args.input.familyId,
        creatorPersonId: personId,
        title: args.input.title,
        eventType: args.input.eventType as EventType,
        startDate: args.input.startDate,
        requesterRole: role,
        ...(args.input.description !== undefined && { description: args.input.description }),
        ...(args.input.startTime !== undefined && { startTime: args.input.startTime }),
        ...(args.input.location !== undefined && { location: args.input.location }),
        ...(args.input.recurrenceRule !== undefined && {
          recurrenceRule: args.input.recurrenceRule,
        }),
      });
    },

    editEvent: async (
      _: unknown,
      args: {
        input: {
          familyId: string;
          eventId: string;
          date: string;
          title?: string;
          description?: string;
          eventType?: string;
          startDate?: string;
          startTime?: string;
          location?: string;
        };
      },
      ctx: Context,
    ) => {
      const { role } = await resolveRequester(ctx, args.input.familyId);
      const updates: Partial<
        Pick<
          FamilyEvent,
          "title" | "description" | "eventType" | "startDate" | "startTime" | "location"
        >
      > = {};
      if (args.input.title !== undefined) updates.title = args.input.title;
      if (args.input.description !== undefined) updates.description = args.input.description;
      if (args.input.eventType !== undefined) updates.eventType = args.input.eventType as EventType;
      if (args.input.startDate !== undefined) updates.startDate = args.input.startDate;
      if (args.input.startTime !== undefined) updates.startTime = args.input.startTime;
      if (args.input.location !== undefined) updates.location = args.input.location;
      await editEvent.execute({
        familyId: args.input.familyId,
        eventId: args.input.eventId,
        date: args.input.date,
        updates,
        requesterRole: role,
      });
      return true;
    },

    deleteEvent: async (
      _: unknown,
      args: { familyId: string; date: string; eventId: string },
      ctx: Context,
    ) => {
      const { role } = await resolveRequester(ctx, args.familyId);
      await deleteEvent.execute(args.familyId, args.date, args.eventId, role);
      return true;
    },

    rsvpEvent: async (_: unknown, args: { eventId: string; status: string }, ctx: Context) => {
      return rsvpEvent.execute({
        eventId: args.eventId,
        personId: ctx.userId,
        status: args.status as RSVPStatus,
      });
    },

    // Chores
    createChore: async (
      _: unknown,
      args: {
        input: {
          familyId: string;
          title: string;
          description?: string;
          assigneePersonId: string;
          dueDate?: string;
          recurrenceRule?: string;
          rotationMembers?: string[];
        };
      },
      ctx: Context,
    ) => {
      const { role } = await resolveRequester(ctx, args.input.familyId);
      return createChore.execute({
        familyId: args.input.familyId,
        title: args.input.title,
        assigneePersonId: args.input.assigneePersonId,
        requesterRole: role,
        ...(args.input.description !== undefined && { description: args.input.description }),
        ...(args.input.dueDate !== undefined && { dueDate: args.input.dueDate }),
        ...(args.input.recurrenceRule !== undefined && {
          recurrenceRule: args.input.recurrenceRule,
        }),
        ...(args.input.rotationMembers !== undefined && {
          rotationMembers: args.input.rotationMembers,
        }),
      });
    },

    completeChore: async (_: unknown, args: { familyId: string; choreId: string }) => {
      await completeChore.execute(args.familyId, args.choreId);
      return true;
    },

    rotateChore: async (_: unknown, args: { familyId: string; choreId: string }) => {
      return rotateChore.execute(args.familyId, args.choreId);
    },

    // Relationships
    createRelationship: async (
      _: unknown,
      args: {
        input: {
          familyId: string;
          personAId: string;
          personBId: string;
          aToBLabel: string;
          bToALabel: string;
          type: string;
        };
      },
      ctx: Context,
    ) => {
      const { role } = await resolveRequester(ctx, args.input.familyId);
      return createRelationship.execute({
        familyId: args.input.familyId,
        personAId: args.input.personAId,
        personBId: args.input.personBId,
        aToBLabel: args.input.aToBLabel,
        bToALabel: args.input.bToALabel,
        type: args.input.type as RelationshipType,
        requesterRole: role,
      });
    },

    editRelationship: async (
      _: unknown,
      args: {
        input: {
          familyId: string;
          personAId: string;
          personBId: string;
          aToBLabel?: string;
          bToALabel?: string;
          type?: string;
        };
      },
      ctx: Context,
    ) => {
      const { role } = await resolveRequester(ctx, args.input.familyId);
      await editRelationship.execute({
        familyId: args.input.familyId,
        personAId: args.input.personAId,
        personBId: args.input.personBId,
        requesterRole: role,
        ...(args.input.aToBLabel !== undefined && { aToBLabel: args.input.aToBLabel }),
        ...(args.input.bToALabel !== undefined && { bToALabel: args.input.bToALabel }),
        ...(args.input.type !== undefined && { type: args.input.type as RelationshipType }),
      });
      return true;
    },

    deleteRelationship: async (
      _: unknown,
      args: { familyId: string; personAId: string; personBId: string },
      ctx: Context,
    ) => {
      const { role } = await resolveRequester(ctx, args.familyId);
      await deleteRelationship.execute(args.familyId, args.personAId, args.personBId, role);
      return true;
    },

    confirmInference: async (
      _: unknown,
      args: { familyId: string; personAId: string; personBId: string },
      ctx: Context,
    ) => {
      const { role } = await resolveRequester(ctx, args.familyId);
      await confirmInference.execute(args.familyId, args.personAId, args.personBId, role);
      return true;
    },

    rejectInference: async (
      _: unknown,
      args: { familyId: string; personAId: string; personBId: string },
      ctx: Context,
    ) => {
      const { role } = await resolveRequester(ctx, args.familyId);
      await rejectInference.execute(args.familyId, args.personAId, args.personBId, role);
      return true;
    },

    // Media
    generateUploadUrl: async (
      _: unknown,
      args: { familyId: string; contentType: string; sizeBytes: number },
      ctx: Context,
    ) => {
      const userId = await resolveUserId(ctx);
      return generateUploadUrl.execute({
        familyId: args.familyId,
        contentType: args.contentType,
        sizeBytes: args.sizeBytes,
        userId,
      });
    },

    confirmMediaUpload: async (
      _: unknown,
      args: {
        input: {
          s3Key: string;
          contentType: string;
          sizeBytes: number;
          familyId: string;
        };
      },
      ctx: Context,
    ) => {
      const userId = await resolveUserId(ctx);
      return confirmMediaUpload.execute({
        s3Key: args.input.s3Key,
        contentType: args.input.contentType as MediaType,
        sizeBytes: args.input.sizeBytes,
        uploadedBy: userId,
        familyId: args.input.familyId,
      });
    },

    // Notifications
    updateNotificationPreference: async (
      _: unknown,
      args: { familyId: string; category: string; enabled: boolean },
      ctx: Context,
    ) => {
      const userId = await resolveUserId(ctx);
      await updateNotificationPreference.execute({
        userId,
        familyId: args.familyId,
        category: args.category as NotificationCategory,
        enabled: args.enabled,
      });
      return true;
    },

    registerDeviceToken: async (
      _: unknown,
      args: { deviceToken: string; platform: string },
      ctx: Context,
    ) => {
      const userId = await resolveUserId(ctx);
      await registerDeviceToken.execute({
        userId,
        deviceToken: args.deviceToken,
        platform: args.platform as "ios" | "android",
      });
      return true;
    },
  },
};

// ─── Server ───

async function start(): Promise<void> {
  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
    context: ({ req }) => {
      const userId = req.headers["x-user-id"] as string | undefined;
      return Promise.resolve({ userId: userId ?? "local-dev-user" });
    },
  });

  console.log(`Local GraphQL API running at ${url}`);
}

start().catch(console.error);
