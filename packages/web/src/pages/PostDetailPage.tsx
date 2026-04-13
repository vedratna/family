import { useMemo, useState, type SyntheticEvent } from "react";
import { useParams, Link } from "react-router";

import { useAddComment } from "../lib/hooks";
import { isApiMode } from "../lib/mode";
import { toCommentItems, personName } from "../lib/transforms";
import { useMockData } from "../providers/MockDataProvider";

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const { posts, comments, reactions, persons } = useMockData();
  const { addComment, loading: commentLoading } = useAddComment();

  const [commentText, setCommentText] = useState("");

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

  function handleAddComment(e: SyntheticEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (isApiMode()) {
      void addComment({ input: { postId, textContent: commentText.trim() } });
    } else {
      console.log("[mock] addComment:", { postId, textContent: commentText.trim() });
    }

    setCommentText("");
  }

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

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value);
            }}
            placeholder="Write a comment..."
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
          />
          <button
            type="submit"
            disabled={commentLoading || !commentText.trim()}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--color-accent-primary)] text-[var(--color-accent-on)] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {commentLoading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
