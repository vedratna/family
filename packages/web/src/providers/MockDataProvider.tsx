import type {
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
import { createContext, useContext, type ReactNode } from "react";

interface SerializedTreeNode {
  personId: string;
  name: string;
  hasAppAccount: boolean;
  generation: number;
  spouseIds: string[];
  childIds: string[];
  parentIds: string[];
}

interface SerializedTree {
  nodes: SerializedTreeNode[];
  rootIds: string[];
  generations: number;
}

export interface MockData {
  families: Family[];
  persons: Person[];
  memberships: FamilyMembership[];
  relationships: Relationship[];
  posts: Post[];
  comments: Comment[];
  reactions: Reaction[];
  events: FamilyEvent[];
  rsvps: EventRSVP[];
  chores: Chore[];
  notificationPrefs: NotificationPreference[];
  familyTree: SerializedTree;
}

const MOCK_FAMILIES: Family[] = [
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

const MOCK_PERSONS: Person[] = [
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

const MOCK_MEMBERSHIPS: FamilyMembership[] = [
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

const MOCK_RELATIONSHIPS: Relationship[] = [
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

const MOCK_POSTS: Post[] = [
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

const MOCK_COMMENTS: Comment[] = [
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

const MOCK_REACTIONS: Reaction[] = [
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

const MOCK_EVENTS: FamilyEvent[] = [
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

const MOCK_RSVPS: EventRSVP[] = [
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

const MOCK_CHORES: Chore[] = [
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

const MOCK_NOTIFICATION_PREFS: NotificationPreference[] = [
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

const MOCK_FAMILY_TREE: SerializedTree = {
  nodes: [
    {
      personId: "person-grandma",
      name: "Grandma Sharma",
      hasAppAccount: true,
      generation: 0,
      spouseIds: [],
      childIds: ["person-rajesh", "person-sunita"],
      parentIds: [],
    },
    {
      personId: "person-rajesh",
      name: "Rajesh Sharma",
      hasAppAccount: true,
      generation: 1,
      spouseIds: ["person-priya"],
      childIds: ["person-amit"],
      parentIds: ["person-grandma"],
    },
    {
      personId: "person-priya",
      name: "Priya Sharma",
      hasAppAccount: true,
      generation: 1,
      spouseIds: ["person-rajesh"],
      childIds: ["person-amit"],
      parentIds: [],
    },
    {
      personId: "person-sunita",
      name: "Sunita Sharma",
      hasAppAccount: false,
      generation: 1,
      spouseIds: [],
      childIds: [],
      parentIds: ["person-grandma"],
    },
    {
      personId: "person-amit",
      name: "Amit Sharma",
      hasAppAccount: true,
      generation: 2,
      spouseIds: [],
      childIds: [],
      parentIds: ["person-rajesh", "person-priya"],
    },
  ],
  rootIds: ["person-grandma"],
  generations: 3,
};

const mockData: MockData = {
  families: MOCK_FAMILIES,
  persons: MOCK_PERSONS,
  memberships: MOCK_MEMBERSHIPS,
  relationships: MOCK_RELATIONSHIPS,
  posts: MOCK_POSTS,
  comments: MOCK_COMMENTS,
  reactions: MOCK_REACTIONS,
  events: MOCK_EVENTS,
  rsvps: MOCK_RSVPS,
  chores: MOCK_CHORES,
  notificationPrefs: MOCK_NOTIFICATION_PREFS,
  familyTree: MOCK_FAMILY_TREE,
};

const MockDataContext = createContext(mockData);

interface MockDataProviderProps {
  children: ReactNode;
}

export function MockDataProvider({ children }: MockDataProviderProps) {
  return <MockDataContext.Provider value={mockData}>{children}</MockDataContext.Provider>;
}

export function useMockData(): MockData {
  return useContext(MockDataContext);
}
