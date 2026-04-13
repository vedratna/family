import type { Post, Comment, Reaction } from "@family-app/shared";

export const MOCK_POSTS: Post[] = [
  {
    id: "post-system",
    familyId: "fam-sharma-001",
    authorPersonId: "system",
    textContent:
      "Welcome to Disney Family! Minnie created this family space. Invites sent to Mickey and Donald.",
    isSystemPost: true,
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "post-001",
    familyId: "fam-sharma-001",
    authorPersonId: "person-priya",
    textContent:
      "Donald's first day at school! He was so excited this morning. Growing up so fast.",
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
    textContent: "Weekend gardening with Donald. Teaching him how to grow tomatoes.",
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

export const MOCK_COMMENTS: Comment[] = [
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

export const MOCK_REACTIONS: Reaction[] = [
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
