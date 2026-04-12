import { useMemo } from "react";
import { Link } from "react-router";

import { toFeedItems, type FeedItem } from "../lib/transforms";
import { useFamily } from "../providers/FamilyProvider";
import { useMockData } from "../providers/MockDataProvider";

const EVENT_TYPE_ICONS: Record<string, string> = {
  birthday: "\uD83C\uDF82",
  anniversary: "\uD83D\uDC8D",
  exam: "\uD83D\uDCDD",
  "social-function": "\uD83C\uDF89",
  holiday: "\uD83C\uDF34",
  marriage: "\uD83D\uDC92",
  custom: "\uD83D\uDCC5",
};

function PostCard({ item }: { item: FeedItem & { type: "post" } }) {
  return (
    <Link
      to={`/feed/${item.id}`}
      className="block p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-secondary)] hover:border-[var(--color-border-primary)] transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center text-xs font-semibold text-[var(--color-accent-primary)]">
          {item.authorName.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">{item.authorName}</p>
          <p className="text-xs text-[var(--color-text-tertiary)]">{item.timeAgo}</p>
        </div>
      </div>
      <p className="text-sm text-[var(--color-text-primary)] mb-3 leading-relaxed">
        {item.textContent}
      </p>
      <div className="flex gap-4 text-xs text-[var(--color-text-secondary)]">
        <span>
          {"\u2764\uFE0F"} {item.reactionCount}
        </span>
        <span>
          {"\uD83D\uDCAC"} {item.commentCount}
        </span>
      </div>
    </Link>
  );
}

function EventCard({ item }: { item: FeedItem & { type: "event" } }) {
  const icon = EVENT_TYPE_ICONS[item.eventType] ?? "\uD83D\uDCC5";
  const daysLabel =
    item.daysAway === 0
      ? "Today"
      : item.daysAway === 1
        ? "Tomorrow"
        : item.daysAway > 0
          ? `In ${String(item.daysAway)} days`
          : `${String(Math.abs(item.daysAway))} days ago`;

  return (
    <Link
      to={`/calendar/${item.id}`}
      className="block p-4 bg-[var(--color-accent-light)] rounded-xl border border-transparent hover:border-[var(--color-accent-primary)] transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">{item.title}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {item.date} &middot; {daysLabel}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function FeedPage() {
  const { posts, events, comments, reactions, persons } = useMockData();
  const { activeFamilyId } = useFamily();

  const feedItems = useMemo(
    () => toFeedItems(posts, events, comments, reactions, persons, activeFamilyId),
    [posts, events, comments, reactions, persons, activeFamilyId],
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">Feed</h1>
      <div className="flex flex-col gap-3">
        {feedItems.map((item) =>
          item.type === "post" ? (
            <PostCard key={item.id} item={item} />
          ) : (
            <EventCard key={item.id} item={item} />
          ),
        )}
      </div>
    </div>
  );
}
