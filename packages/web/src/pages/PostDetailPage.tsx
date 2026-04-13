import { useMemo, useState, type SyntheticEvent } from "react";
import { useParams, Link } from "react-router";
import { useQuery } from "urql";

import { Loading } from "../components/Loading";
import { QueryError } from "../components/QueryError";
import { formatErrorMessage } from "../lib/error-utils";
import {
  POST_DETAIL_QUERY,
  POST_COMMENTS_QUERY,
  POST_REACTIONS_QUERY,
} from "../lib/graphql-operations";
import { useAddComment } from "../lib/hooks";
import { isApiMode } from "../lib/mode";
import { toCommentItems, personName, computeTimeAgo, type CommentItem } from "../lib/transforms";
import { useFamily } from "../providers/FamilyProvider";
import { useMockData } from "../providers/MockDataProvider";

interface ApiPost {
  id: string;
  familyId: string;
  authorPersonId: string;
  authorName: string;
  textContent: string;
  isSystemPost: boolean;
  createdAt: string;
}

interface ApiComment {
  id: string;
  postId: string;
  personId: string;
  personName: string;
  textContent: string;
  createdAt: string;
}

interface ApiReaction {
  postId: string;
  personId: string;
  emoji: string;
  createdAt: string;
}

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const mockData = useMockData();
  const { activeFamilyId } = useFamily();
  const { addComment, loading: commentLoading } = useAddComment();

  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);

  const [postResult, reexecutePost] = useQuery({
    query: POST_DETAIL_QUERY,
    variables: { postId: postId ?? "", familyId: activeFamilyId },
    pause: !isApiMode() || postId === undefined || !activeFamilyId,
  });

  const [commentsResult, reexecuteComments] = useQuery({
    query: POST_COMMENTS_QUERY,
    variables: { postId: postId ?? "" },
    pause: !isApiMode() || postId === undefined,
  });

  const [reactionsResult, reexecuteReactions] = useQuery({
    query: POST_REACTIONS_QUERY,
    variables: { postId: postId ?? "" },
    pause: !isApiMode() || postId === undefined,
  });

  const post = useMemo(() => {
    if (isApiMode()) {
      const raw = postResult.data as { postDetail: ApiPost | null } | undefined;
      return raw?.postDetail ?? null;
    }
    return mockData.posts.find((p) => p.id === postId) ?? null;
  }, [postResult.data, mockData.posts, postId]);

  const reactionCount = useMemo(() => {
    if (isApiMode()) {
      const raw = reactionsResult.data as { postReactions: ApiReaction[] } | undefined;
      return raw?.postReactions.length ?? 0;
    }
    return mockData.reactions.filter((r) => r.postId === postId).length;
  }, [reactionsResult.data, mockData.reactions, postId]);

  const commentItems = useMemo((): CommentItem[] => {
    if (isApiMode()) {
      const raw = commentsResult.data as
        | { postComments: { items: ApiComment[]; cursor: string | null } }
        | undefined;
      return (raw?.postComments.items ?? []).map((c) => ({
        id: c.id,
        authorName: c.personName,
        textContent: c.textContent,
        timeAgo: computeTimeAgo(c.createdAt),
      }));
    }
    return toCommentItems(mockData.comments, postId ?? "", mockData.persons);
  }, [commentsResult.data, mockData.comments, mockData.persons, postId]);

  const loading = isApiMode() && (postResult.fetching || commentsResult.fetching);

  if (postResult.error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Link to="/feed" className="text-sm text-[var(--color-accent-primary)] hover:underline">
          &larr; Back to Feed
        </Link>
        <QueryError
          error={postResult.error}
          onRetry={() => {
            reexecutePost({ requestPolicy: "network-only" });
          }}
        />
      </div>
    );
  }

  if (commentsResult.error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Link to="/feed" className="text-sm text-[var(--color-accent-primary)] hover:underline">
          &larr; Back to Feed
        </Link>
        <QueryError
          error={commentsResult.error}
          onRetry={() => {
            reexecuteComments({ requestPolicy: "network-only" });
          }}
        />
      </div>
    );
  }

  if (reactionsResult.error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Link to="/feed" className="text-sm text-[var(--color-accent-primary)] hover:underline">
          &larr; Back to Feed
        </Link>
        <QueryError
          error={reactionsResult.error}
          onRetry={() => {
            reexecuteReactions({ requestPolicy: "network-only" });
          }}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Link to="/feed" className="text-sm text-[var(--color-accent-primary)] hover:underline">
          &larr; Back to Feed
        </Link>
        <Loading />
      </div>
    );
  }

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

  const authorName = isApiMode()
    ? (post as ApiPost).authorName
    : personName(mockData.persons, post.authorPersonId);

  function handleAddComment(e: SyntheticEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentError(null);

    if (isApiMode()) {
      void addComment({
        input: { postId, familyId: activeFamilyId, textContent: commentText.trim() },
      }).then((result) => {
        if (result.error) {
          setCommentError(formatErrorMessage(result.error));
          return;
        }
        reexecuteComments({ requestPolicy: "network-only" });
        setCommentText("");
      });
    } else {
      console.log("[mock] addComment:", { postId, textContent: commentText.trim() });
      setCommentText("");
    }
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
            {"\u2764\uFE0F"} {reactionCount}
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
        <form onSubmit={handleAddComment} className="mt-4">
          <div className="flex gap-2">
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
          </div>
          {commentError !== null && <p className="text-sm text-red-600 mt-2">{commentError}</p>}
        </form>
      </div>
    </div>
  );
}
