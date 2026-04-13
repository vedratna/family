import { useMemo, useState, useEffect, useCallback, type SyntheticEvent } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useQuery, useClient } from "urql";

import { ConfirmModal } from "../components/ConfirmModal";
import { Lightbox } from "../components/Lightbox";
import { LoadMoreButton } from "../components/LoadMoreButton";
import { Loading } from "../components/Loading";
import { MediaThumbnail } from "../components/MediaThumbnail";
import { QueryError } from "../components/QueryError";
import { formatErrorMessage } from "../lib/error-utils";
import {
  POST_DETAIL_QUERY,
  POST_COMMENTS_QUERY,
  POST_REACTIONS_QUERY,
} from "../lib/graphql-operations";
import { useAddComment, useDeletePost, useAddReaction, useRemoveReaction } from "../lib/hooks";
import { isApiMode } from "../lib/mode";
import { canDeletePost } from "../lib/permissions";
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
  mediaUrls?: string[];
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
  const navigate = useNavigate();
  const mockData = useMockData();
  const { activeFamilyId, activePersonId, activeRole } = useFamily();
  const urqlClient = useClient();
  const { addComment, loading: commentLoading } = useAddComment();
  const { deletePost, loading: deleteLoading } = useDeletePost();
  const { addReaction, loading: addReactionLoading } = useAddReaction();
  const { removeReaction, loading: removeReactionLoading } = useRemoveReaction();

  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [reactionError, setReactionError] = useState<string | null>(null);
  const [accumulatedComments, setAccumulatedComments] = useState<ApiComment[]>([]);
  const [commentCursor, setCommentCursor] = useState<string | null>(null);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

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

  const reactions = useMemo((): ApiReaction[] => {
    if (isApiMode()) {
      const raw = reactionsResult.data as { postReactions: ApiReaction[] } | undefined;
      return raw?.postReactions ?? [];
    }
    return mockData.reactions.filter((r) => r.postId === postId) as ApiReaction[];
  }, [reactionsResult.data, mockData.reactions, postId]);

  const reactionCount = reactions.length;

  const hasReacted = useMemo(() => {
    if (activePersonId === undefined) return false;
    return reactions.some((r) => r.personId === activePersonId);
  }, [reactions, activePersonId]);

  // Populate accumulated comments from initial query
  useEffect(() => {
    if (!isApiMode()) return;
    if (commentsResult.fetching) return;
    const raw = commentsResult.data as
      | { postComments: { items: ApiComment[]; cursor: string | null } }
      | undefined;
    if (raw === undefined) return;
    setAccumulatedComments(raw.postComments.items);
    setCommentCursor(raw.postComments.cursor);
  }, [commentsResult.fetching, commentsResult.data]);

  const loadMoreComments = useCallback(() => {
    if (!isApiMode() || commentCursor === null || loadingMoreComments) return;
    setLoadingMoreComments(true);
    void urqlClient
      .query(POST_COMMENTS_QUERY, { postId, cursor: commentCursor })
      .toPromise()
      .then((result) => {
        const raw = result.data as
          | { postComments: { items: ApiComment[]; cursor: string | null } }
          | undefined;
        if (raw) {
          setAccumulatedComments((prev) => [...prev, ...raw.postComments.items]);
          setCommentCursor(raw.postComments.cursor);
        }
        setLoadingMoreComments(false);
      });
  }, [urqlClient, postId, commentCursor, loadingMoreComments]);

  const commentItems = useMemo((): CommentItem[] => {
    if (isApiMode()) {
      return accumulatedComments.map((c) => ({
        id: c.id,
        authorName: c.personName,
        textContent: c.textContent,
        timeAgo: computeTimeAgo(c.createdAt),
      }));
    }
    return toCommentItems(mockData.comments, postId ?? "", mockData.persons);
  }, [accumulatedComments, mockData.comments, mockData.persons, postId]);

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

  const authorLabel = isApiMode()
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

  function handleDeletePost() {
    setDeleteError(null);
    if (isApiMode()) {
      void deletePost({ familyId: activeFamilyId, postId }).then((result) => {
        if (result.error) {
          setDeleteError(formatErrorMessage(result.error));
          setShowDeleteModal(false);
          return;
        }
        setShowDeleteModal(false);
        void navigate("/feed");
      });
    } else {
      console.log("[mock] deletePost:", { familyId: activeFamilyId, postId });
      setShowDeleteModal(false);
      void navigate("/feed");
    }
  }

  function handleReactionToggle() {
    setReactionError(null);
    if (!isApiMode()) {
      console.log("[mock] toggleReaction:", { postId });
      return;
    }

    if (hasReacted) {
      void removeReaction({ postId }).then((result) => {
        if (result.error) {
          setReactionError(formatErrorMessage(result.error));
          return;
        }
        reexecuteReactions({ requestPolicy: "network-only" });
      });
    } else {
      void addReaction({ postId, emoji: "\u2764\uFE0F" }).then((result) => {
        if (result.error) {
          setReactionError(formatErrorMessage(result.error));
          return;
        }
        reexecuteReactions({ requestPolicy: "network-only" });
      });
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
            {authorLabel.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{authorLabel}</p>
          </div>
        </div>
        <p className="text-sm text-[var(--color-text-primary)] leading-relaxed mb-3">
          {post.textContent}
        </p>
        {isApiMode() && ((post as ApiPost).mediaUrls ?? []).length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {((post as ApiPost).mediaUrls ?? []).map((url) => (
              <MediaThumbnail
                key={url}
                url={url}
                isVideo={/\.(mp4|mov|webm|avi)(\?|$)/i.test(url) || url.includes("video")}
                onClick={() => {
                  setLightboxUrl(url);
                }}
              />
            ))}
          </div>
        )}
        <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
          <button
            type="button"
            onClick={handleReactionToggle}
            disabled={addReactionLoading || removeReactionLoading}
            className="flex items-center gap-1 hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            <span>{hasReacted ? "\u2764\uFE0F" : "\uD83E\uDD0D"}</span>
            <span>{reactionCount}</span>
          </button>
          <span>
            {"\uD83D\uDCAC"} {commentItems.length}
          </span>
        </div>
        {reactionError !== null && <p className="text-xs text-red-600 mt-1">{reactionError}</p>}
      </div>

      {/* Delete Post */}
      {canDeletePost(activeRole, post.authorPersonId, activePersonId) && (
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setShowDeleteModal(true);
            }}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            Delete Post
          </button>
          {deleteError !== null && <span className="text-sm text-red-600">{deleteError}</span>}
        </div>
      )}

      <ConfirmModal
        open={showDeleteModal}
        title="Delete Post"
        message="Delete this post? This cannot be undone."
        confirmLabel="Delete"
        loading={deleteLoading}
        onConfirm={handleDeletePost}
        onCancel={() => {
          setShowDeleteModal(false);
        }}
      />

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
        {isApiMode() && (
          <LoadMoreButton
            visible={commentCursor !== null}
            onClick={loadMoreComments}
            loading={loadingMoreComments}
          />
        )}

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
      <Lightbox
        url={lightboxUrl}
        isVideo={
          lightboxUrl !== null &&
          (/\.(mp4|mov|webm|avi)(\?|$)/i.test(lightboxUrl) || lightboxUrl.includes("video"))
        }
        onClose={() => {
          setLightboxUrl(null);
        }}
      />
    </div>
  );
}
