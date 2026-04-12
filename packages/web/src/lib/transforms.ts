import type {
  Post,
  Comment,
  Reaction,
  FamilyEvent,
  Person,
  Chore,
  FamilyMembership,
  ChoreStatus,
  Role,
  RelationshipType,
  RelationshipStatus,
} from "@family-app/shared";

// --- Feed ---

interface FeedItemPost {
  type: "post";
  id: string;
  authorName: string;
  textContent: string;
  timeAgo: string;
  reactionCount: number;
  commentCount: number;
  createdAt: string;
}

interface FeedItemEvent {
  type: "event";
  id: string;
  title: string;
  date: string;
  daysAway: number;
  eventType: string;
  createdAt: string;
}

export type FeedItem = FeedItemPost | FeedItemEvent;

function computeTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 60) return `${String(diffMinutes)}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${String(diffHours)}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${String(diffDays)}d ago`;
}

function computeDaysAway(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function personName(persons: Person[], personId: string): string {
  return persons.find((p) => p.id === personId)?.name ?? personId;
}

export function toFeedItems(
  posts: Post[],
  events: FamilyEvent[],
  comments: Comment[],
  reactions: Reaction[],
  persons: Person[],
  familyId: string,
): FeedItem[] {
  const familyPosts = posts.filter((p) => p.familyId === familyId);
  const familyEvents = events.filter((e) => e.familyId === familyId);

  const postItems: FeedItem[] = familyPosts.map((post) => ({
    type: "post",
    id: post.id,
    authorName: personName(persons, post.authorPersonId),
    textContent: post.textContent,
    timeAgo: computeTimeAgo(post.createdAt),
    reactionCount: reactions.filter((r) => r.postId === post.id).length,
    commentCount: comments.filter((c) => c.postId === post.id).length,
    createdAt: post.createdAt,
  }));

  const eventItems: FeedItem[] = familyEvents.map((event) => ({
    type: "event",
    id: event.id,
    title: event.title,
    date: event.startDate,
    daysAway: computeDaysAway(event.startDate),
    eventType: event.eventType,
    createdAt: event.createdAt,
  }));

  return [...postItems, ...eventItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

// --- Calendar Agenda ---

export interface AgendaEvent {
  id: string;
  title: string;
  eventType: string;
  startDate: string;
  startTime?: string;
  location?: string;
}

export interface AgendaSection {
  date: string;
  dateLabel: string;
  events: AgendaEvent[];
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function toAgendaSections(events: FamilyEvent[], familyId: string): AgendaSection[] {
  const familyEvents = events.filter((e) => e.familyId === familyId);
  const grouped = new Map<string, FamilyEvent[]>();

  for (const event of familyEvents) {
    const existing = grouped.get(event.startDate);
    if (existing) {
      existing.push(event);
    } else {
      grouped.set(event.startDate, [event]);
    }
  }

  const sortedDates = [...grouped.keys()].sort();
  return sortedDates.map((date) => ({
    date,
    dateLabel: formatDateLabel(date),
    events: (grouped.get(date) ?? []).map(
      (e): AgendaEvent => ({
        id: e.id,
        title: e.title,
        eventType: e.eventType,
        startDate: e.startDate,
        ...(e.startTime !== undefined ? { startTime: e.startTime } : {}),
        ...(e.location !== undefined ? { location: e.location } : {}),
      }),
    ),
  }));
}

// --- Calendar Month ---

export interface DayData {
  date: number;
  isCurrentMonth: boolean;
  hasEvents: boolean;
  isToday: boolean;
}

export function toMonthDays(
  events: FamilyEvent[],
  year: number,
  month: number,
  familyId: string,
): DayData[] {
  const familyEvents = events.filter((e) => e.familyId === familyId);
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const eventDates = new Set(
    familyEvents
      .filter((e) => {
        const d = new Date(e.startDate);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map((e) => new Date(e.startDate).getDate()),
  );

  const days: DayData[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      date: daysInPrevMonth - i,
      isCurrentMonth: false,
      hasEvents: false,
      isToday: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      date: d,
      isCurrentMonth: true,
      hasEvents: eventDates.has(d),
      isToday: year === todayYear && month === todayMonth && d === todayDate,
    });
  }

  const totalCells = Math.ceil(days.length / 7) * 7;
  for (let d = 1; days.length < totalCells; d++) {
    days.push({ date: d, isCurrentMonth: false, hasEvents: false, isToday: false });
  }

  return days;
}

// --- Chores ---

export interface ChoreItem {
  id: string;
  title: string;
  assigneeName: string;
  dueDate?: string;
  status: ChoreStatus;
}

export function toChoreItems(chores: Chore[], persons: Person[], familyId: string): ChoreItem[] {
  return chores
    .filter((c) => c.familyId === familyId)
    .map(
      (c): ChoreItem => ({
        id: c.id,
        title: c.title,
        assigneeName: personName(persons, c.assigneePersonId),
        ...(c.dueDate !== undefined ? { dueDate: c.dueDate } : {}),
        status: c.status,
      }),
    );
}

// --- Members ---

export interface MemberItem {
  personId: string;
  name: string;
  role: Role;
  hasAppAccount: boolean;
}

export function toMemberItems(
  persons: Person[],
  memberships: FamilyMembership[],
  familyId: string,
): MemberItem[] {
  const familyMemberships = memberships.filter((m) => m.familyId === familyId);
  return familyMemberships.map((m) => {
    const person = persons.find((p) => p.id === m.personId);
    return {
      personId: m.personId,
      name: person?.name ?? m.personId,
      role: m.role,
      hasAppAccount: person?.userId !== undefined,
    };
  });
}

// --- Post Detail ---

export interface CommentItem {
  id: string;
  authorName: string;
  textContent: string;
  timeAgo: string;
}

export function toCommentItems(
  comments: Comment[],
  postId: string,
  persons: Person[],
): CommentItem[] {
  return comments
    .filter((c) => c.postId === postId)
    .map((c) => ({
      id: c.id,
      authorName: personName(persons, c.personId),
      textContent: c.textContent,
      timeAgo: computeTimeAgo(c.createdAt),
    }));
}

// --- Person Relationships ---

export interface PersonRelationship {
  label: string;
  otherPersonName: string;
  type: RelationshipType;
  status: RelationshipStatus;
}

export { computeTimeAgo, computeDaysAway, personName };
