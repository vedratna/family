import { useState, useMemo, type SyntheticEvent } from "react";
import { Link } from "react-router";
import { useQuery } from "urql";

import { FAMILY_FEED_QUERY } from "../lib/graphql-operations";
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

interface ApiFeedPost {
  id: string;
  familyId: string;
  authorPersonId: string;
  textContent: string;
  isSystemPost: boolean;
  createdAt: string;
}

export function FeedPage() {
  const mockData = useMockData();
  const { activeFamilyId } = useFamily();
  const { createPost, loading: postLoading } = useCreatePost();

  const [showForm, setShowForm] = useState(false);
  const [newPostText, setNewPostText] = useState("");

  const [feedResult, reexecuteFeed] = useQuery({
    query: FAMILY_FEED_QUERY,
    variables: { familyId: activeFamilyId },
    pause: !isApiMode() || !activeFamilyId,
  });

  const feedItems = useMemo((): FeedItem[] | null => {
    if (isApiMode()) {
      if (feedResult.fetching) return null;
      const raw = feedResult.data as
        | { familyFeed: { items: ApiFeedPost[]; cursor: string | null } }
        | undefined;
      const posts = raw?.familyFeed.items ?? [];
      return posts.map(
        (post): FeedItem => ({
          type: "post",
          id: post.id,
          authorName: post.authorPersonId,
          textContent: post.textContent,
          timeAgo: computeTimeAgo(post.createdAt),
          reactionCount: 0,
          commentCount: 0,
          createdAt: post.createdAt,
        }),
      );
    }
    return toFeedItems(
      mockData.posts,
      mockData.events,
      mockData.comments,
      mockData.reactions,
      mockData.persons,
      activeFamilyId,
    );
  }, [feedResult.fetching, feedResult.data, mockData, activeFamilyId]);

  function handleSubmitPost(e: SyntheticEvent) {
    e.preventDefault();
    if (!newPostText.trim()) return;

    if (isApiMode()) {
      void createPost({
        input: { familyId: activeFamilyId, textContent: newPostText.trim() },
      }).then(() => {
        reexecuteFeed({ requestPolicy: "network-only" });
      });
    } else {
      console.log("[mock] createPost:", {
        familyId: activeFamilyId,
        textContent: newPostText.trim(),
      });
    }

    setNewPostText("");
    setShowForm(false);
  }

  if (feedItems === null) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <p className="text-sm text-[var(--color-text-secondary)]">Loading feed...</p>
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
    </div>
  );
}
