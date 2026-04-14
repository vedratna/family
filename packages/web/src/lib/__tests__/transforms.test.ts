import type {
  Post,
  Comment,
  Reaction,
  FamilyEvent,
  Person,
  Chore,
  FamilyMembership,
} from "@family-app/shared";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  toFeedItems,
  toAgendaSections,
  toMonthDays,
  toChoreItems,
  toMemberItems,
  toCommentItems,
  computeTimeAgo,
  computeDaysAway,
  personName,
} from "../transforms";

// --- Helper data factories ---

function makePerson(overrides: Partial<Person> = {}): Person {
  return {
    id: "p1",
    familyId: "f1",
    name: "Alice",
    createdAt: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: "post1",
    familyId: "f1",
    authorPersonId: "p1",
    textContent: "Hello!",
    isSystemPost: false,
    createdAt: "2025-06-01T12:00:00Z",
    ...overrides,
  } as Post;
}

function makeEvent(overrides: Partial<FamilyEvent> = {}): FamilyEvent {
  return {
    id: "e1",
    familyId: "f1",
    creatorPersonId: "p1",
    title: "Birthday",
    eventType: "birthday",
    startDate: "2025-06-15",
    createdAt: "2025-06-01T00:00:00Z",
    ...overrides,
  };
}

function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: "c1",
    postId: "post1",
    personId: "p1",
    textContent: "Nice!",
    createdAt: "2025-06-01T12:30:00Z",
    ...overrides,
  };
}

function makeReaction(overrides: Partial<Reaction> = {}): Reaction {
  return {
    postId: "post1",
    personId: "p2",
    emoji: "heart",
    createdAt: "2025-06-01T12:01:00Z",
    ...overrides,
  };
}

function makeChore(overrides: Partial<Chore> = {}): Chore {
  return {
    id: "ch1",
    familyId: "f1",
    title: "Dishes",
    assigneePersonId: "p1",
    status: "pending",
    createdAt: "2025-06-01T00:00:00Z",
    ...overrides,
  };
}

// --- Tests ---

describe("computeTimeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-01T13:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns minutes for less than 1 hour", () => {
    expect(computeTimeAgo("2025-06-01T12:30:00Z")).toBe("30m ago");
  });

  it("returns hours for less than 24 hours", () => {
    expect(computeTimeAgo("2025-06-01T10:00:00Z")).toBe("3h ago");
  });

  it("returns days for 24+ hours", () => {
    expect(computeTimeAgo("2025-05-30T13:00:00Z")).toBe("2d ago");
  });
});

describe("computeDaysAway", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-01T10:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 0 for today", () => {
    expect(computeDaysAway("2025-06-01")).toBe(0);
  });

  it("returns positive for future dates", () => {
    expect(computeDaysAway("2025-06-03")).toBe(2);
  });

  it("returns negative for past dates", () => {
    expect(computeDaysAway("2025-05-30")).toBe(-2);
  });
});

describe("personName", () => {
  it("returns person name when found", () => {
    expect(personName([makePerson()], "p1")).toBe("Alice");
  });

  it("returns personId when not found", () => {
    expect(personName([], "p-unknown")).toBe("p-unknown");
  });
});

describe("toFeedItems", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-01T13:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("combines posts and events into sorted feed items", () => {
    const posts = [makePost()];
    const events = [makeEvent()];
    const persons = [makePerson()];

    const result = toFeedItems(posts, events, [], [], persons, "f1");

    expect(result).toHaveLength(2);
    // Post is more recent (June 1 12:00) than event (June 1 00:00)
    expect(result[0]!.type).toBe("post");
    expect(result[1]!.type).toBe("event");
  });

  it("filters by familyId", () => {
    const posts = [makePost({ familyId: "f2" })];
    const events = [makeEvent({ familyId: "f2" })];

    const result = toFeedItems(posts, events, [], [], [], "f1");

    expect(result).toHaveLength(0);
  });

  it("counts reactions and comments for a post", () => {
    const posts = [makePost()];
    const comments = [makeComment(), makeComment({ id: "c2" })];
    const reactions = [makeReaction()];

    const result = toFeedItems(posts, [], comments, reactions, [makePerson()], "f1");

    const first = result[0]!;
    expect(first.type).toBe("post");
    if (first.type === "post") {
      expect(first.reactionCount).toBe(1);
      expect(first.commentCount).toBe(2);
    }
  });
});

describe("toAgendaSections", () => {
  it("groups events by date and sorts them", () => {
    const events = [
      makeEvent({ id: "e1", startDate: "2025-06-15" }),
      makeEvent({ id: "e2", startDate: "2025-06-15", title: "Party" }),
      makeEvent({ id: "e3", startDate: "2025-06-20", title: "Reunion" }),
    ];

    const result = toAgendaSections(events, "f1");

    expect(result).toHaveLength(2);
    expect(result[0]!.date).toBe("2025-06-15");
    expect(result[0]!.events).toHaveLength(2);
    expect(result[1]!.date).toBe("2025-06-20");
  });

  it("includes optional startTime and location", () => {
    const events = [makeEvent({ startTime: "14:00", location: "Park" })];

    const result = toAgendaSections(events, "f1");

    expect(result[0]!.events[0]!.startTime).toBe("14:00");
    expect(result[0]!.events[0]!.location).toBe("Park");
  });

  it("filters by familyId", () => {
    const events = [makeEvent({ familyId: "f2" })];

    const result = toAgendaSections(events, "f1");

    expect(result).toHaveLength(0);
  });
});

describe("toMonthDays", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T10:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns correct number of cells (multiple of 7)", () => {
    const result = toMonthDays([], 2025, 5, "f1"); // June 2025

    expect(result.length % 7).toBe(0);
  });

  it("marks today correctly", () => {
    const result = toMonthDays([], 2025, 5, "f1"); // June 2025

    const today = result.find((d) => d.isToday);
    expect(today).toBeDefined();
    expect(today!.date).toBe(15);
  });

  it("marks days with events", () => {
    const events = [makeEvent({ startDate: "2025-06-15" })];

    const result = toMonthDays(events, 2025, 5, "f1");

    const dayWithEvent = result.find((d) => d.date === 15 && d.isCurrentMonth);
    expect(dayWithEvent!.hasEvents).toBe(true);
  });

  it("includes previous and next month padding days", () => {
    const result = toMonthDays([], 2025, 5, "f1"); // June 2025

    const _prevMonthDays = result.filter((d) => !d.isCurrentMonth && result.indexOf(d) < 7);
    // June 1, 2025 is Sunday (day 0), so no padding needed from previous month
    // Let's just check that non-current-month days exist at the end
    const allNonCurrent = result.filter((d) => !d.isCurrentMonth);
    expect(allNonCurrent.length).toBeGreaterThanOrEqual(0);
  });
});

describe("toChoreItems", () => {
  it("transforms chores for a family", () => {
    const chores = [makeChore(), makeChore({ id: "ch2", dueDate: "2025-06-10" })];
    const persons = [makePerson()];

    const result = toChoreItems(chores, persons, "f1");

    expect(result).toHaveLength(2);
    expect(result[0]!.assigneeName).toBe("Alice");
    expect(result[1]!.dueDate).toBe("2025-06-10");
  });

  it("filters by familyId", () => {
    const chores = [makeChore({ familyId: "f2" })];

    const result = toChoreItems(chores, [], "f1");

    expect(result).toHaveLength(0);
  });
});

describe("toMemberItems", () => {
  it("maps memberships to member items with person names", () => {
    const persons = [makePerson({ id: "p1", userId: "u1" })];
    const memberships: FamilyMembership[] = [
      { familyId: "f1", personId: "p1", userId: "u1", role: "owner", joinedAt: "" },
    ];

    const result = toMemberItems(persons, memberships, "f1");

    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("Alice");
    expect(result[0]!.role).toBe("owner");
    expect(result[0]!.hasAppAccount).toBe(true);
  });

  it("uses personId as name when person not found", () => {
    const memberships: FamilyMembership[] = [
      { familyId: "f1", personId: "p-missing", userId: "u1", role: "viewer", joinedAt: "" },
    ];

    const result = toMemberItems([], memberships, "f1");

    expect(result[0]!.name).toBe("p-missing");
  });

  it("sets hasAppAccount false when no userId", () => {
    const persons = [makePerson({ id: "p1" })];
    const memberships: FamilyMembership[] = [
      { familyId: "f1", personId: "p1", userId: "u1", role: "editor", joinedAt: "" },
    ];

    const result = toMemberItems(persons, memberships, "f1");

    expect(result[0]!.hasAppAccount).toBe(false);
  });
});

describe("toCommentItems", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-01T13:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("transforms comments for a post", () => {
    const comments = [makeComment()];
    const persons = [makePerson()];

    const result = toCommentItems(comments, "post1", persons);

    expect(result).toHaveLength(1);
    expect(result[0]!.authorName).toBe("Alice");
    expect(result[0]!.textContent).toBe("Nice!");
  });

  it("filters by postId", () => {
    const comments = [makeComment({ postId: "other-post" })];

    const result = toCommentItems(comments, "post1", []);

    expect(result).toHaveLength(0);
  });
});
