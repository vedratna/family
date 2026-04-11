import type { Comment, Reaction, FamilyEvent, Post, Person } from "@family-app/shared";
import { useCallback, useMemo, useState } from "react";
import { Pressable, Text } from "react-native";

import { useFamily } from "../providers/FamilyProvider";
import { useMockData } from "../providers/MockDataProvider";
import { useNavigation } from "../shared/navigation/ScreenRouter";

interface FeedItemPost {
  type: "post";
  id: string;
  authorName: string;
  textContent: string;
  timeAgo: string;
  mediaUrls: string[];
  reactionCount: number;
  commentCount: number;
}

interface FeedItemEvent {
  type: "event";
  id: string;
  title: string;
  date: string;
  daysAway: number;
  eventType: string;
}

type FeedItem = FeedItemPost | FeedItemEvent;

interface FeedScreenProps {
  items: FeedItem[];
  isLocked: boolean;
  isDefiner: boolean;
  showChecklist: boolean;
  checklistItems: { id: string; label: string; completed: boolean }[];
  pendingInvites: { name: string; status: "pending" | "sent" }[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onReact: (postId: string) => void;
  onComment: (postId: string) => void;
  onPostPress: (postId: string) => void;
  onEventPress: (eventId: string) => void;
  onInviteMore: () => void;
  onAddEvent: () => void;
  onAddToTree: () => void;
  onDismissChecklist: () => void;
}

interface CommentItem {
  id: string;
  authorName: string;
  textContent: string;
  timeAgo: string;
}

interface CommentsScreenProps {
  postAuthorName: string;
  postTextPreview: string;
  comments: CommentItem[];
  onSubmitComment: (text: string) => void;
  onLoadMore: () => void;
}

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

function buildPostItem(
  post: Post,
  persons: Person[],
  reactions: Reaction[],
  comments: Comment[],
): FeedItemPost {
  return {
    type: "post",
    id: post.id,
    authorName: personName(persons, post.authorPersonId),
    textContent: post.textContent,
    timeAgo: computeTimeAgo(post.createdAt),
    mediaUrls: [],
    reactionCount: reactions.filter((r) => r.postId === post.id).length,
    commentCount: comments.filter((c) => c.postId === post.id).length,
  };
}

function buildEventItem(event: FamilyEvent): FeedItemEvent {
  return {
    type: "event",
    id: event.id,
    title: event.title,
    date: event.startDate,
    daysAway: computeDaysAway(event.startDate),
    eventType: event.eventType,
  };
}

// Placeholder screen components — real screens are provided externally
function FeedScreen(_props: FeedScreenProps) {
  return null;
}

function CommentsScreen(_props: CommentsScreenProps) {
  return null;
}

export function FeedContainer() {
  const { posts, comments, reactions, events, persons } = useMockData();
  const { activeFamilyId } = useFamily();
  const { screenState, navigate, goBack } = useNavigation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const familyPosts = useMemo(
    () => posts.filter((p) => p.familyId === activeFamilyId),
    [posts, activeFamilyId],
  );

  const familyEvents = useMemo(
    () => events.filter((e) => e.familyId === activeFamilyId),
    [events, activeFamilyId],
  );

  const feedItems = useMemo<FeedItem[]>(() => {
    const postItems = familyPosts.map((p) => buildPostItem(p, persons, reactions, comments));
    const eventItems = familyEvents.map(buildEventItem);
    return [...postItems, ...eventItems];
  }, [familyPosts, familyEvents, persons, reactions, comments]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Mock refresh — in real app this would refetch
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, []);

  const onComment = useCallback(
    (postId: string) => {
      navigate("comments", { postId });
    },
    [navigate],
  );

  const onPostPress = useCallback(
    (postId: string) => {
      navigate("comments", { postId });
    },
    [navigate],
  );

  const onEventPress = useCallback(
    (eventId: string) => {
      navigate("detail", { eventId });
    },
    [navigate],
  );

  if (screenState.screen === "comments") {
    const postId = screenState.params["postId"] ?? "";
    const post = familyPosts.find((p) => p.id === postId);
    const postComments = comments.filter((c) => c.postId === postId);

    const commentItems: CommentItem[] = postComments.map((c) => ({
      id: c.id,
      authorName: personName(persons, c.personId),
      textContent: c.textContent,
      timeAgo: computeTimeAgo(c.createdAt),
    }));

    return (
      <>
        <Pressable onPress={goBack}>
          <Text>{"← Back"}</Text>
        </Pressable>
        <CommentsScreen
          postAuthorName={post ? personName(persons, post.authorPersonId) : ""}
          postTextPreview={post?.textContent ?? ""}
          comments={commentItems}
          onSubmitComment={() => {}}
          onLoadMore={() => {}}
        />
      </>
    );
  }

  return (
    <FeedScreen
      items={feedItems}
      isLocked={false}
      isDefiner={true}
      showChecklist={false}
      checklistItems={[]}
      pendingInvites={[]}
      isRefreshing={isRefreshing}
      onRefresh={onRefresh}
      onLoadMore={() => {}}
      onReact={() => {}}
      onComment={onComment}
      onPostPress={onPostPress}
      onEventPress={onEventPress}
      onInviteMore={() => {}}
      onAddEvent={() => {}}
      onAddToTree={() => {}}
      onDismissChecklist={() => {}}
    />
  );
}
