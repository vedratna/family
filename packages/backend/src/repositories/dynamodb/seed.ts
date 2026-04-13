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

// ── Users ──────────────────────────────────────────────────────────────────────

const SEED_USERS: User[] = [
  {
    id: "user-1",
    cognitoSub: "user-1",
    phone: "+919876543210",
    displayName: "Raj Sharma",
    createdAt: "2026-03-01T09:00:00Z",
  },
  {
    id: "user-2",
    cognitoSub: "user-2",
    phone: "+919876543211",
    displayName: "Priya Verma",
    createdAt: "2026-03-01T09:01:00Z",
  },
];

// ── Families ───────────────────────────────────────────────────────────────────

const SEED_FAMILIES: Family[] = [
  {
    id: "fam-sharma-001",
    name: "Sharma Family",
    createdBy: "user-priya",
    themeName: "teal",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "fam-verma-001",
    name: "Verma Family",
    createdBy: "user-priya",
    themeName: "coral",
    createdAt: "2026-03-15T10:00:00Z",
  },
];

// ── Persons ────────────────────────────────────────────────────────────────────

const SEED_PERSONS: Person[] = [
  {
    id: "person-grandma",
    familyId: "fam-sharma-001",
    userId: "user-grandma",
    name: "Grandma Sharma",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "person-rajesh",
    familyId: "fam-sharma-001",
    userId: "user-rajesh",
    name: "Rajesh Sharma",
    createdAt: "2026-03-01T10:01:00Z",
  },
  {
    id: "person-priya",
    familyId: "fam-sharma-001",
    userId: "user-priya",
    name: "Priya Sharma",
    createdAt: "2026-03-01T10:02:00Z",
  },
  {
    id: "person-amit",
    familyId: "fam-sharma-001",
    userId: "user-amit",
    name: "Amit Sharma",
    createdAt: "2026-03-02T10:00:00Z",
  },
  {
    id: "person-sunita",
    familyId: "fam-sharma-001",
    name: "Sunita Sharma",
    createdAt: "2026-03-01T10:03:00Z",
  },
  {
    id: "person-priya-v",
    familyId: "fam-verma-001",
    userId: "user-priya",
    name: "Priya Verma",
    createdAt: "2026-03-15T10:00:00Z",
  },
];

// ── Memberships ────────────────────────────────────────────────────────────────

const SEED_MEMBERSHIPS: FamilyMembership[] = [
  {
    familyId: "fam-sharma-001",
    personId: "person-priya",
    userId: "user-priya",
    role: "owner",
    joinedAt: "2026-03-01T10:00:00Z",
  },
  {
    familyId: "fam-sharma-001",
    personId: "person-rajesh",
    userId: "user-rajesh",
    role: "admin",
    joinedAt: "2026-03-01T12:00:00Z",
  },
  {
    familyId: "fam-sharma-001",
    personId: "person-amit",
    userId: "user-amit",
    role: "editor",
    joinedAt: "2026-03-02T10:00:00Z",
  },
  {
    familyId: "fam-verma-001",
    personId: "person-priya-v",
    userId: "user-priya",
    role: "editor",
    joinedAt: "2026-03-15T10:00:00Z",
  },
];

// ── Relationships ──────────────────────────────────────────────────────────────

const SEED_RELATIONSHIPS: Relationship[] = [
  {
    id: "rel-001",
    familyId: "fam-sharma-001",
    personAId: "person-grandma",
    personBId: "person-rajesh",
    aToBLabel: "Mother",
    bToALabel: "Son",
    type: "parent-child",
    status: "confirmed",
    createdAt: "2026-03-01T10:10:00Z",
  },
  {
    id: "rel-002",
    familyId: "fam-sharma-001",
    personAId: "person-grandma",
    personBId: "person-sunita",
    aToBLabel: "Mother",
    bToALabel: "Daughter",
    type: "parent-child",
    status: "confirmed",
    createdAt: "2026-03-01T10:11:00Z",
  },
  {
    id: "rel-003",
    familyId: "fam-sharma-001",
    personAId: "person-rajesh",
    personBId: "person-priya",
    aToBLabel: "Husband",
    bToALabel: "Wife",
    type: "spouse",
    status: "confirmed",
    createdAt: "2026-03-01T10:12:00Z",
  },
  {
    id: "rel-004",
    familyId: "fam-sharma-001",
    personAId: "person-rajesh",
    personBId: "person-amit",
    aToBLabel: "Father",
    bToALabel: "Son",
    type: "parent-child",
    status: "confirmed",
    createdAt: "2026-03-02T10:00:00Z",
  },
  {
    id: "rel-005",
    familyId: "fam-sharma-001",
    personAId: "person-grandma",
    personBId: "person-priya",
    aToBLabel: "Mother-in-law",
    bToALabel: "Daughter-in-law",
    type: "in-law",
    status: "pending",
    createdAt: "2026-03-01T10:15:00Z",
  },
];

// ── Posts ───────────────────────────────────────────────────────────────────────

const SEED_POSTS: Post[] = [
  {
    id: "post-system",
    familyId: "fam-sharma-001",
    authorPersonId: "system",
    textContent:
      "Welcome to Sharma Family! Priya created this family space. Invites sent to Rajesh and Amit.",
    isSystemPost: true,
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "post-001",
    familyId: "fam-sharma-001",
    authorPersonId: "person-priya",
    textContent: "Amit's first day at school! He was so excited this morning. Growing up so fast.",
    isSystemPost: false,
    createdAt: "2026-04-05T08:30:00Z",
  },
  {
    id: "post-002",
    familyId: "fam-sharma-001",
    authorPersonId: "person-rajesh",
    textContent: "Family trip to Shimla is ON for May! Start planning everyone.",
    isSystemPost: false,
    createdAt: "2026-04-04T19:00:00Z",
  },
  {
    id: "post-003",
    familyId: "fam-sharma-001",
    authorPersonId: "person-amit",
    textContent: "Made a drawing for Grandma today!",
    isSystemPost: false,
    createdAt: "2026-04-03T16:00:00Z",
  },
  {
    id: "post-004",
    familyId: "fam-sharma-001",
    authorPersonId: "person-grandma",
    textContent: "Thank you everyone for the lovely birthday wishes yesterday. Love you all.",
    isSystemPost: false,
    createdAt: "2026-04-02T09:00:00Z",
  },
  {
    id: "post-005",
    familyId: "fam-sharma-001",
    authorPersonId: "person-priya",
    textContent: "Diwali dinner was amazing! So good to have everyone together.",
    isSystemPost: false,
    createdAt: "2026-04-01T21:00:00Z",
  },
  {
    id: "post-006",
    familyId: "fam-sharma-001",
    authorPersonId: "person-rajesh",
    textContent: "Weekend gardening with Amit. Teaching him how to grow tomatoes.",
    isSystemPost: false,
    createdAt: "2026-03-30T11:00:00Z",
  },
  {
    id: "post-007",
    familyId: "fam-sharma-001",
    authorPersonId: "person-priya",
    textContent: "Sunday brunch recipe that everyone loved. Sharing the secret!",
    isSystemPost: false,
    createdAt: "2026-03-29T12:00:00Z",
  },
];

// ── Comments ───────────────────────────────────────────────────────────────────

const SEED_COMMENTS: Comment[] = [
  {
    id: "cmt-001",
    postId: "post-001",
    personId: "person-grandma",
    textContent: "So proud! He looks so smart.",
    createdAt: "2026-04-05T09:00:00Z",
  },
  {
    id: "cmt-002",
    postId: "post-001",
    personId: "person-sunita",
    textContent: "Growing up so fast!",
    createdAt: "2026-04-05T09:30:00Z",
  },
  {
    id: "cmt-003",
    postId: "post-001",
    personId: "person-rajesh",
    textContent: "My big boy!",
    createdAt: "2026-04-05T10:00:00Z",
  },
  {
    id: "cmt-004",
    postId: "post-002",
    personId: "person-priya",
    textContent: "Can't wait! Let's book the hotel.",
    createdAt: "2026-04-04T20:00:00Z",
  },
  {
    id: "cmt-005",
    postId: "post-002",
    personId: "person-grandma",
    textContent: "I'll make snacks for the drive!",
    createdAt: "2026-04-04T21:00:00Z",
  },
];

// ── Reactions ──────────────────────────────────────────────────────────────────

const SEED_REACTIONS: Reaction[] = [
  {
    postId: "post-001",
    personId: "person-grandma",
    emoji: "\u2764\uFE0F",
    createdAt: "2026-04-05T08:45:00Z",
  },
  {
    postId: "post-001",
    personId: "person-rajesh",
    emoji: "\u2764\uFE0F",
    createdAt: "2026-04-05T08:50:00Z",
  },
  {
    postId: "post-001",
    personId: "person-sunita",
    emoji: "\uD83D\uDE0D",
    createdAt: "2026-04-05T09:00:00Z",
  },
  {
    postId: "post-002",
    personId: "person-priya",
    emoji: "\uD83D\uDE4F",
    createdAt: "2026-04-04T19:30:00Z",
  },
  {
    postId: "post-002",
    personId: "person-amit",
    emoji: "\uD83D\uDE4F",
    createdAt: "2026-04-04T20:00:00Z",
  },
  {
    postId: "post-003",
    personId: "person-grandma",
    emoji: "\u2764\uFE0F",
    createdAt: "2026-04-03T17:00:00Z",
  },
  {
    postId: "post-004",
    personId: "person-priya",
    emoji: "\u2764\uFE0F",
    createdAt: "2026-04-02T10:00:00Z",
  },
  {
    postId: "post-004",
    personId: "person-rajesh",
    emoji: "\u2764\uFE0F",
    createdAt: "2026-04-02T10:30:00Z",
  },
];

// ── Events ─────────────────────────────────────────────────────────────────────

const SEED_EVENTS: FamilyEvent[] = [
  {
    id: "evt-001",
    familyId: "fam-sharma-001",
    creatorPersonId: "person-priya",
    title: "Grandma's 75th Birthday",
    eventType: "birthday",
    startDate: "2026-04-12",
    startTime: "18:00",
    location: "Grandma's House",
    description: "Big celebration! Everyone please bring a dish.",
    recurrenceRule: "ANNUALLY",
    createdAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "evt-002",
    familyId: "fam-sharma-001",
    creatorPersonId: "person-rajesh",
    title: "Rajesh & Priya Anniversary",
    eventType: "anniversary",
    startDate: "2026-03-20",
    startTime: "19:00",
    location: "The Grand Restaurant",
    recurrenceRule: "ANNUALLY",
    createdAt: "2026-03-01T12:00:00Z",
  },
  {
    id: "evt-003",
    familyId: "fam-sharma-001",
    creatorPersonId: "person-priya",
    title: "Amit's Math Exam",
    eventType: "exam",
    startDate: "2026-04-20",
    startTime: "09:00",
    description: "Final exam. No distractions day before!",
    createdAt: "2026-04-01T10:00:00Z",
  },
];

// ── RSVPs ──────────────────────────────────────────────────────────────────────

const SEED_RSVPS: EventRSVP[] = [
  {
    eventId: "evt-001",
    personId: "person-priya",
    status: "going",
    updatedAt: "2026-03-10T10:01:00Z",
  },
  {
    eventId: "evt-001",
    personId: "person-rajesh",
    status: "going",
    updatedAt: "2026-03-10T12:00:00Z",
  },
  {
    eventId: "evt-001",
    personId: "person-amit",
    status: "going",
    updatedAt: "2026-03-11T10:00:00Z",
  },
  {
    eventId: "evt-001",
    personId: "person-sunita",
    status: "maybe",
    updatedAt: "2026-03-12T10:00:00Z",
  },
  {
    eventId: "evt-002",
    personId: "person-grandma",
    status: "going",
    updatedAt: "2026-03-02T10:00:00Z",
  },
];

// ── Chores ─────────────────────────────────────────────────────────────────────

const SEED_CHORES: Chore[] = [
  {
    id: "chore-001",
    familyId: "fam-sharma-001",
    title: "Take out trash",
    assigneePersonId: "person-amit",
    dueDate: "2026-04-08",
    recurrenceRule: "WEEKLY",
    rotationMembers: ["person-amit", "person-rajesh", "person-priya"],
    status: "pending",
    createdAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "chore-002",
    familyId: "fam-sharma-001",
    title: "Clean garage",
    description: "Full clean including reorganizing shelves",
    assigneePersonId: "person-rajesh",
    dueDate: "2026-04-06",
    status: "completed",
    completedAt: "2026-04-06T15:00:00Z",
    createdAt: "2026-04-01T10:00:00Z",
  },
  {
    id: "chore-003",
    familyId: "fam-sharma-001",
    title: "Water the garden",
    assigneePersonId: "person-amit",
    dueDate: "2026-04-05",
    status: "overdue",
    createdAt: "2026-04-01T10:00:00Z",
  },
];

// ── Notification Preferences ───────────────────────────────────────────────────

const SEED_NOTIFICATION_PREFS: NotificationPreference[] = [
  { userId: "user-priya", familyId: "fam-sharma-001", category: "events-reminders", enabled: true },
  {
    userId: "user-priya",
    familyId: "fam-sharma-001",
    category: "social-comments-on-own",
    enabled: true,
  },
  { userId: "user-priya", familyId: "fam-sharma-001", category: "social-feed", enabled: false },
  { userId: "user-priya", familyId: "fam-sharma-001", category: "family-updates", enabled: false },
];

// ── Table creation ─────────────────────────────────────────────────────────────

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

// ── Seed runner ────────────────────────────────────────────────────────────────

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
