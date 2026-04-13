import { useMemo } from "react";
import { useParams, Link } from "react-router";

import { toCommentItems, personName } from "../lib/transforms";
import { useMockData } from "../providers/MockDataProvider";

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const { posts, comments, reactions, persons } = useMockData();

  const post = posts.find((p) => p.id === postId);

  const postReactions = useMemo(
    () => reactions.filter((r) => r.postId === postId),
    [reactions, postId],
  );

  const commentItems = useMemo(
    () => toCommentItems(comments, postId ?? "", persons),
    [comments, postId, persons],
  );

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Link to="/feed" className="text-sm text-[var(--color-accent-primary)] hover:underline">
          &larr; Back to Feed
        </Link>
        <p className="mt-4 text-[var(--color-text-secondary)]">Post not found.</p>
      </div>
    );
  }

  const authorName = personName(persons, post.authorPersonId);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Link to="/feed" className="text-sm text-[var(--color-accent-primary)] hover:underline">
        &larr; Back to Feed
      </Link>

      <div className="mt-4 p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-secondary)]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center text-sm font-semibold text-[var(--color-accent-primary)]">
            {authorName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{authorName}</p>
          </div>
        </div>
        <p className="text-sm text-[var(--color-text-primary)] leading-relaxed mb-3">
          {post.textContent}
        </p>
        <div className="flex gap-4 text-xs text-[var(--color-text-secondary)]">
          <span>
            {"\u2764\uFE0F"} {postReactions.length}
          </span>
          <span>
            {"\uD83D\uDCAC"} {commentItems.length}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-3">
          Comments ({commentItems.length})
        </h2>
        <div className="flex flex-col gap-3">
          {commentItems.map((comment) => (
            <div key={comment.id} className="p-3 bg-[var(--color-bg-secondary)] rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {comment.authorName}
                </span>
                <span className="text-xs text-[var(--color-text-tertiary)]">{comment.timeAgo}</span>
              </div>
              <p className="text-sm text-[var(--color-text-primary)]">{comment.textContent}</p>
            </div>
          ))}
          {commentItems.length === 0 && (
            <p className="text-sm text-[var(--color-text-tertiary)]">No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
