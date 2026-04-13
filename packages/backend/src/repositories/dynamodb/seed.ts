import { CreateTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import type {
  User,
  Family,
  Person,
  FamilyMembership,
  Relationship,
  Post,
  Comment,
  Reaction,
  FamilyEvent,
  EventRSVP,
  Chore,
  NotificationPreference,
} from "@family-app/shared";

import { DynamoChoreRepository } from "./chore-repo";
import { DynamoCommentRepository } from "./comment-repo";
import { DynamoEventRepository } from "./event-repo";
import { DynamoEventRSVPRepository } from "./event-rsvp-repo";
import { DynamoFamilyRepository } from "./family-repo";
import { DynamoMembershipRepository } from "./membership-repo";
import { DynamoNotificationPrefRepository } from "./notification-pref-repo";
import { DynamoPersonRepository } from "./person-repo";
import { DynamoPostRepository } from "./post-repo";
import { DynamoReactionRepository } from "./reaction-repo";
import { DynamoRelationshipRepository } from "./relationship-repo";
import { DynamoUserRepository } from "./user-repo";

const ENDPOINT = process.env["DYNAMODB_ENDPOINT"] ?? "http://localhost:8000";
const TABLE_NAME = process.env["TABLE_NAME"] ?? "family-dev";

const client = new DynamoDBClient({
  endpoint: ENDPOINT,
  region: "local",
  credentials: { accessKeyId: "local", secretAccessKey: "local" },
});

// Two app users: Mickey Mouse (user-1) and Bart Simpson (user-2)
// Mickey owns Disney Family, also joins Simpson Family as admin (multi-family demo)
// Bart owns Simpson Family

const SEED_USERS: User[] = [
  {
    id: "user-1",
    cognitoSub: "user-1",
    phone: "+919876543210",
    displayName: "Mickey Mouse",
    createdAt: "2026-03-01T09:00:00Z",
  },
  {
    id: "user-2",
    cognitoSub: "user-2",
    phone: "+919876543211",
    displayName: "Bart Simpson",
    createdAt: "2026-03-01T09:01:00Z",
  },
];

const SEED_FAMILIES: Family[] = [
  {
    id: "family-disney",
    name: "Disney Family",
    createdBy: "user-1",
    themeName: "teal",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "family-simpson",
    name: "Simpson Family",
    createdBy: "user-2",
    themeName: "coral",
    createdAt: "2026-03-15T10:00:00Z",
  },
];

const SEED_PERSONS: Person[] = [
  // Disney Family — Mickey is the app user, others are non-app persons
  {
    id: "person-mickey",
    familyId: "family-disney",
    userId: "user-1",
    name: "Mickey Mouse",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "person-minnie",
    familyId: "family-disney",
    name: "Minnie Mouse",
    createdAt: "2026-03-01T10:01:00Z",
  },
  {
    id: "person-donald",
    familyId: "family-disney",
    name: "Donald Duck",
    createdAt: "2026-03-01T10:02:00Z",
  },
  {
    id: "person-daisy",
    familyId: "family-disney",
    name: "Daisy Duck",
    createdAt: "2026-03-01T10:03:00Z",
  },
  {
    id: "person-bart-dis",
    familyId: "family-disney",
    userId: "user-2",
    name: "Bart Simpson",
    createdAt: "2026-03-02T10:00:00Z",
  },
  // Simpson Family — Bart is the app user, plus Mickey joining as admin
  {
    id: "person-bart",
    familyId: "family-simpson",
    userId: "user-2",
    name: "Bart Simpson",
    createdAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "person-mickey-sim",
    familyId: "family-simpson",
    userId: "user-1",
    name: "Mickey Mouse",
    createdAt: "2026-03-15T10:01:00Z",
  },
  {
    id: "person-homer",
    familyId: "family-simpson",
    name: "Homer Simpson",
    createdAt: "2026-03-15T10:02:00Z",
  },
  {
    id: "person-lisa",
    familyId: "family-simpson",
    name: "Lisa Simpson",
    createdAt: "2026-03-15T10:03:00Z",
  },
];

const SEED_MEMBERSHIPS: FamilyMembership[] = [
  {
    familyId: "family-disney",
    personId: "person-mickey",
    userId: "user-1",
    role: "owner",
    joinedAt: "2026-03-01T10:00:00Z",
  },
  {
    familyId: "family-disney",
    personId: "person-bart-dis",
    userId: "user-2",
    role: "editor",
    joinedAt: "2026-03-02T10:00:00Z",
  },
  {
    familyId: "family-simpson",
    personId: "person-bart",
    userId: "user-2",
    role: "owner",
    joinedAt: "2026-03-15T10:00:00Z",
  },
  {
    familyId: "family-simpson",
    personId: "person-mickey-sim",
    userId: "user-1",
    role: "admin",
    joinedAt: "2026-03-15T10:01:00Z",
  },
];

const SEED_RELATIONSHIPS: Relationship[] = [
  {
    id: "rel-001",
    familyId: "family-disney",
    personAId: "person-mickey",
    personBId: "person-minnie",
    aToBLabel: "Husband",
    bToALabel: "Wife",
    type: "spouse",
    status: "confirmed",
    createdAt: "2026-03-01T10:10:00Z",
  },
  {
    id: "rel-002",
    familyId: "family-disney",
    personAId: "person-donald",
    personBId: "person-daisy",
    aToBLabel: "Nephew",
    bToALabel: "Aunt",
    type: "custom",
    status: "confirmed",
    createdAt: "2026-03-01T10:11:00Z",
  },
  {
    id: "rel-003",
    familyId: "family-simpson",
    personAId: "person-homer",
    personBId: "person-bart",
    aToBLabel: "Father",
    bToALabel: "Son",
    type: "parent-child",
    status: "confirmed",
    createdAt: "2026-03-15T10:10:00Z",
  },
  {
    id: "rel-004",
    familyId: "family-simpson",
    personAId: "person-homer",
    personBId: "person-lisa",
    aToBLabel: "Father",
    bToALabel: "Daughter",
    type: "parent-child",
    status: "confirmed",
    createdAt: "2026-03-15T10:11:00Z",
  },
  {
    id: "rel-005",
    familyId: "family-simpson",
    personAId: "person-bart",
    personBId: "person-lisa",
    aToBLabel: "Brother",
    bToALabel: "Sister",
    type: "sibling",
    status: "confirmed",
    createdAt: "2026-03-15T10:12:00Z",
  },
];

const SEED_POSTS: Post[] = [
  {
    id: "post-system-disney",
    familyId: "family-disney",
    authorPersonId: "system",
    textContent: "Welcome to Disney Family! Mickey created this family space.",
    isSystemPost: true,
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "post-001",
    familyId: "family-disney",
    authorPersonId: "person-mickey",
    textContent: "Great day at the park with Minnie and Donald!",
    isSystemPost: false,
    createdAt: "2026-04-05T08:30:00Z",
  },
  {
    id: "post-002",
    familyId: "family-disney",
    authorPersonId: "person-mickey",
    textContent: "Family movie night on Friday — who's in?",
    isSystemPost: false,
    createdAt: "2026-04-04T19:00:00Z",
  },
  {
    id: "post-003",
    familyId: "family-simpson",
    authorPersonId: "person-bart",
    textContent: "Aye caramba! First post in the Simpson Family space.",
    isSystemPost: false,
    createdAt: "2026-04-05T10:00:00Z",
  },
  {
    id: "post-004",
    familyId: "family-simpson",
    authorPersonId: "person-mickey-sim",
    textContent: "Thanks for letting me join the Simpson Family!",
    isSystemPost: false,
    createdAt: "2026-04-06T12:00:00Z",
  },
];

const SEED_COMMENTS: Comment[] = [
  {
    id: "cmt-001",
    postId: "post-001",
    personId: "person-mickey",
    textContent: "Such a fun day!",
    createdAt: "2026-04-05T09:00:00Z",
  },
  {
    id: "cmt-002",
    postId: "post-002",
    personId: "person-mickey",
    textContent: "Count me in!",
    createdAt: "2026-04-04T20:00:00Z",
  },
  {
    id: "cmt-003",
    postId: "post-003",
    personId: "person-bart",
    textContent: "More posts coming!",
    createdAt: "2026-04-05T10:30:00Z",
  },
];

const SEED_REACTIONS: Reaction[] = [
  {
    postId: "post-001",
    personId: "person-mickey",
    emoji: "\u2764\uFE0F",
    createdAt: "2026-04-05T08:45:00Z",
  },
  {
    postId: "post-002",
    personId: "person-mickey",
    emoji: "\uD83D\uDE0D",
    createdAt: "2026-04-04T19:30:00Z",
  },
  {
    postId: "post-003",
    personId: "person-bart",
    emoji: "\uD83C\uDF89",
    createdAt: "2026-04-05T10:15:00Z",
  },
];

const SEED_EVENTS: FamilyEvent[] = [
  {
    id: "evt-001",
    familyId: "family-disney",
    creatorPersonId: "person-mickey",
    title: "Mickey & Minnie Anniversary",
    eventType: "anniversary",
    startDate: "2026-05-15",
    startTime: "19:00",
    location: "The Grand Restaurant",
    recurrenceRule: "ANNUALLY",
    createdAt: "2026-03-01T12:00:00Z",
  },
  {
    id: "evt-002",
    familyId: "family-disney",
    creatorPersonId: "person-mickey",
    title: "Donald's Birthday",
    eventType: "birthday",
    startDate: "2026-04-20",
    startTime: "16:00",
    location: "Mickey's House",
    createdAt: "2026-04-01T10:00:00Z",
  },
  {
    id: "evt-003",
    familyId: "family-simpson",
    creatorPersonId: "person-bart",
    title: "Lisa's Saxophone Recital",
    eventType: "social-function",
    startDate: "2026-04-25",
    startTime: "18:00",
    location: "Springfield Elementary",
    createdAt: "2026-04-01T10:00:00Z",
  },
];

const SEED_RSVPS: EventRSVP[] = [
  {
    eventId: "evt-001",
    personId: "person-mickey",
    status: "going",
    updatedAt: "2026-03-10T10:00:00Z",
  },
  {
    eventId: "evt-002",
    personId: "person-mickey",
    status: "going",
    updatedAt: "2026-04-05T10:00:00Z",
  },
  {
    eventId: "evt-003",
    personId: "person-bart",
    status: "going",
    updatedAt: "2026-04-05T10:00:00Z",
  },
];

const SEED_CHORES: Chore[] = [
  {
    id: "chore-001",
    familyId: "family-disney",
    title: "Take out trash",
    assigneePersonId: "person-donald",
    dueDate: "2026-04-15",
    recurrenceRule: "WEEKLY",
    status: "pending",
    createdAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "chore-002",
    familyId: "family-disney",
    title: "Water the plants",
    assigneePersonId: "person-minnie",
    dueDate: "2026-04-14",
    status: "completed",
    completedAt: "2026-04-14T15:00:00Z",
    createdAt: "2026-04-01T10:00:00Z",
  },
  {
    id: "chore-003",
    familyId: "family-simpson",
    title: "Skateboard practice",
    assigneePersonId: "person-bart",
    dueDate: "2026-04-16",
    status: "pending",
    createdAt: "2026-04-10T10:00:00Z",
  },
];

const SEED_NOTIFICATION_PREFS: NotificationPreference[] = [
  {
    userId: "user-1",
    familyId: "family-disney",
    category: "events-reminders",
    enabled: true,
  },
  {
    userId: "user-1",
    familyId: "family-disney",
    category: "social-feed",
    enabled: true,
  },
  {
    userId: "user-2",
    familyId: "family-simpson",
    category: "events-reminders",
    enabled: true,
  },
];

async function createTable(): Promise<void> {
  try {
    await client.send(
      new CreateTableCommand({
        TableName: TABLE_NAME,
        KeySchema: [
          { AttributeName: "PK", KeyType: "HASH" },
          { AttributeName: "SK", KeyType: "RANGE" },
        ],
        AttributeDefinitions: [
          { AttributeName: "PK", AttributeType: "S" },
          { AttributeName: "SK", AttributeType: "S" },
          { AttributeName: "GSI1PK", AttributeType: "S" },
          { AttributeName: "GSI1SK", AttributeType: "S" },
          { AttributeName: "GSI2PK", AttributeType: "S" },
          { AttributeName: "GSI2SK", AttributeType: "S" },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: "GSI1",
            KeySchema: [
              { AttributeName: "GSI1PK", KeyType: "HASH" },
              { AttributeName: "GSI1SK", KeyType: "RANGE" },
            ],
            Projection: { ProjectionType: "ALL" },
          },
          {
            IndexName: "GSI2",
            KeySchema: [
              { AttributeName: "GSI2PK", KeyType: "HASH" },
              { AttributeName: "GSI2SK", KeyType: "RANGE" },
            ],
            Projection: { ProjectionType: "ALL" },
          },
        ],
        BillingMode: "PAY_PER_REQUEST",
      }),
    );
    console.log(`Table "${TABLE_NAME}" created.`);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ResourceInUseException") {
      console.log(`Table "${TABLE_NAME}" already exists, proceeding with seed.`);
      return;
    }
    throw error;
  }
}

async function seed(): Promise<void> {
  await createTable();

  const userRepo = new DynamoUserRepository();
  const familyRepo = new DynamoFamilyRepository();
  const personRepo = new DynamoPersonRepository();
  const membershipRepo = new DynamoMembershipRepository();
  const relationshipRepo = new DynamoRelationshipRepository();
  const postRepo = new DynamoPostRepository();
  const commentRepo = new DynamoCommentRepository();
  const reactionRepo = new DynamoReactionRepository();
  const eventRepo = new DynamoEventRepository();
  const rsvpRepo = new DynamoEventRSVPRepository();
  const choreRepo = new DynamoChoreRepository();
  const notifPrefRepo = new DynamoNotificationPrefRepository();

  console.log("Seeding users...");
  for (const user of SEED_USERS) {
    await userRepo.create(user);
  }

  console.log("Seeding families...");
  for (const family of SEED_FAMILIES) {
    await familyRepo.create(family);
  }

  console.log("Seeding persons...");
  for (const person of SEED_PERSONS) {
    await personRepo.create(person);
  }

  console.log("Seeding memberships...");
  for (const membership of SEED_MEMBERSHIPS) {
    await membershipRepo.create(membership);
  }

  console.log("Seeding relationships...");
  for (const relationship of SEED_RELATIONSHIPS) {
    await relationshipRepo.create(relationship);
  }

  console.log("Seeding posts...");
  for (const post of SEED_POSTS) {
    await postRepo.create(post);
  }

  console.log("Seeding comments...");
  for (const comment of SEED_COMMENTS) {
    await commentRepo.create(comment);
  }

  console.log("Seeding reactions...");
  for (const reaction of SEED_REACTIONS) {
    await reactionRepo.add(reaction);
  }

  console.log("Seeding events...");
  for (const event of SEED_EVENTS) {
    await eventRepo.create(event);
  }

  console.log("Seeding RSVPs...");
  for (const rsvp of SEED_RSVPS) {
    await rsvpRepo.upsert(rsvp);
  }

  console.log("Seeding chores...");
  for (const chore of SEED_CHORES) {
    await choreRepo.create(chore);
  }

  console.log("Seeding notification preferences...");
  for (const pref of SEED_NOTIFICATION_PREFS) {
    await notifPrefRepo.upsert(pref);
  }

  console.log("Seed complete.");
}

seed().catch((error: unknown) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
