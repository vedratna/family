import { useState, useMemo, useEffect, useCallback, type SyntheticEvent } from "react";
import { Link } from "react-router";
import { useQuery, useClient } from "urql";

import { LoadMoreButton } from "../components/LoadMoreButton";
import { Loading } from "../components/Loading";
import { QueryError } from "../components/QueryError";
import { formatErrorMessage } from "../lib/error-utils";
import { FAMILY_FEED_QUERY, FAMILY_EVENTS_QUERY } from "../lib/graphql-operations";
import { useCreatePost } from "../lib/hooks";
import { isApiMode } from "../lib/mode";
import { toFeedItems, type FeedItem, computeTimeAgo } from "../lib/transforms";
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
      to={`/calendar/${item.date}/${item.id}`}
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

interface ApiFeedPost {
  id: string;
  familyId: string;
  authorPersonId: string;
  authorName: string;
  textContent: string;
  isSystemPost: boolean;
  createdAt: string;
  reactionCount: number;
  commentCount: number;
}

export function FeedPage() {
  const mockData = useMockData();
  const { activeFamilyId } = useFamily();
  const { createPost, loading: postLoading } = useCreatePost();
  const urqlClient = useClient();

  const [showForm, setShowForm] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [postError, setPostError] = useState<string | null>(null);

  // Pagination state (API mode only)
  const [accumulatedPosts, setAccumulatedPosts] = useState<ApiFeedPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initializedFamilyId, setInitializedFamilyId] = useState("");

  const [feedResult, reexecuteFeed] = useQuery({
    query: FAMILY_FEED_QUERY,
    variables: { familyId: activeFamilyId },
    pause: !isApiMode() || !activeFamilyId,
  });

  // When feed result arrives (initial load), populate accumulated items
  useEffect(() => {
    if (!isApiMode()) return;
    if (feedResult.fetching) return;
    const raw = feedResult.data as
      | { familyFeed: { items: ApiFeedPost[]; cursor: string | null } }
      | undefined;
    if (raw === undefined) return;
    setAccumulatedPosts(raw.familyFeed.items);
    setNextCursor(raw.familyFeed.cursor);
    setInitializedFamilyId(activeFamilyId);
  }, [feedResult.fetching, feedResult.data, activeFamilyId]);

  // Reset when family changes
  useEffect(() => {
    if (isApiMode() && activeFamilyId !== initializedFamilyId) {
      setAccumulatedPosts([]);
      setNextCursor(null);
    }
  }, [activeFamilyId, initializedFamilyId]);

  const loadMore = useCallback(() => {
    if (!isApiMode() || nextCursor === null || loadingMore) return;
    setLoadingMore(true);
    void urqlClient
      .query(FAMILY_FEED_QUERY, { familyId: activeFamilyId, cursor: nextCursor })
      .toPromise()
      .then((result) => {
        const raw = result.data as
          | { familyFeed: { items: ApiFeedPost[]; cursor: string | null } }
          | undefined;
        if (raw) {
          setAccumulatedPosts((prev) => [...prev, ...raw.familyFeed.items]);
          setNextCursor(raw.familyFeed.cursor);
        }
        setLoadingMore(false);
      });
  }, [urqlClient, activeFamilyId, nextCursor, loadingMore]);

  // In API mode, also fetch upcoming events to mix into the feed
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const ninetyDaysOut = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().slice(0, 10);
  }, []);
  const [eventsResult, reexecuteEvents] = useQuery({
    query: FAMILY_EVENTS_QUERY,
    variables: { familyId: activeFamilyId, startDate: today, endDate: ninetyDaysOut },
    pause: !isApiMode() || !activeFamilyId,
  });

  const feedItems = useMemo((): FeedItem[] | null => {
    if (isApiMode()) {
      if (feedResult.fetching && accumulatedPosts.length === 0) return null;
      const posts = accumulatedPosts;
      const postItems: FeedItem[] = posts.map((post) => ({
        type: "post",
        id: post.id,
        authorName: post.authorName,
        textContent: post.textContent,
        timeAgo: computeTimeAgo(post.createdAt),
        reactionCount: post.reactionCount,
        commentCount: post.commentCount,
        createdAt: post.createdAt,
      }));

      const evRaw = eventsResult.data as
        | {
            familyEvents: {
              id: string;
              title: string;
              eventType: string;
              startDate: string;
            }[];
          }
        | undefined;
      const events = evRaw?.familyEvents ?? [];
      const todayDate = new Date(today);
      const eventItems: FeedItem[] = events.map((ev) => {
        const eventDate = new Date(ev.startDate);
        const daysAway = Math.ceil(
          (eventDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        return {
          type: "event",
          id: ev.id,
          title: ev.title,
          date: ev.startDate,
          daysAway,
          eventType: ev.eventType,
          createdAt: ev.startDate,
        };
      });

      return [...postItems, ...eventItems].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }
    return toFeedItems(
      mockData.posts,
      mockData.events,
      mockData.comments,
      mockData.reactions,
      mockData.persons,
      activeFamilyId,
    );
  }, [feedResult.fetching, accumulatedPosts, eventsResult.data, mockData, activeFamilyId, today]);

  function handleSubmitPost(e: SyntheticEvent) {
    e.preventDefault();
    if (!newPostText.trim()) return;

    setPostError(null);

    if (isApiMode()) {
      void createPost({
        input: { familyId: activeFamilyId, textContent: newPostText.trim() },
      }).then((result) => {
        if (result.error) {
          setPostError(formatErrorMessage(result.error));
          return;
        }
        reexecuteFeed({ requestPolicy: "network-only" });
        setNewPostText("");
        setShowForm(false);
      });
    } else {
      console.log("[mock] createPost:", {
        familyId: activeFamilyId,
        textContent: newPostText.trim(),
      });
      setNewPostText("");
      setShowForm(false);
    }
  }

  if (feedResult.error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <QueryError
          error={feedResult.error}
          onRetry={() => {
            reexecuteFeed({ requestPolicy: "network-only" });
          }}
        />
      </div>
    );
  }

  if (eventsResult.error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <QueryError
          error={eventsResult.error}
          onRetry={() => {
            reexecuteEvents({ requestPolicy: "network-only" });
          }}
        />
      </div>
    );
  }

  if (feedItems === null) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Loading label="Loading feed..." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Feed</h1>
        <button
          onClick={() => {
            setShowForm((v) => !v);
          }}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[var(--color-accent-primary)] text-[var(--color-accent-on)] hover:opacity-90 transition-opacity"
        >
          {showForm ? "Cancel" : "New Post"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmitPost}
          className="mb-4 p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-secondary)]"
        >
          <textarea
            value={newPostText}
            onChange={(e) => {
              setNewPostText(e.target.value);
            }}
            placeholder="What's on your mind?"
            className="w-full p-2 text-sm rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] resize-none"
            rows={3}
          />
          {postError !== null && <p className="mt-2 text-sm text-red-600">{postError}</p>}
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={postLoading || !newPostText.trim()}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-[var(--color-accent-primary)] text-[var(--color-accent-on)] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {postLoading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {feedItems.map((item) =>
          item.type === "post" ? (
            <PostCard key={item.id} item={item} />
          ) : (
            <EventCard key={item.id} item={item} />
          ),
        )}
        {feedItems.length === 0 && (
          <p className="text-sm text-[var(--color-text-tertiary)]">No posts yet — create one!</p>
        )}
      </div>
      {isApiMode() && (
        <LoadMoreButton visible={nextCursor !== null} onClick={loadMore} loading={loadingMore} />
      )}
    </div>
  );
}
