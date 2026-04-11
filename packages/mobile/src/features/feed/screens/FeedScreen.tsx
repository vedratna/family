import { useCallback } from "react";
import { View, Text, FlatList, RefreshControl, StyleSheet } from "react-native";
import { Share } from "react-native";

import { useTheme } from "../../../shared/theme";
import { LockedFeedState } from "../../onboarding/components/LockedFeedState";
import { SetupChecklist } from "../../onboarding/components/SetupChecklist";
import { EventCard } from "../components/EventCard";
import { PostCard } from "../components/PostCard";

type FeedItem =
  | {
      type: "post";
      id: string;
      authorName: string;
      textContent: string;
      timeAgo: string;
      mediaUrls: string[];
      reactionCount: number;
      commentCount: number;
    }
  | { type: "event"; id: string; title: string; date: string; daysAway: number; eventType: string };

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

export function FeedScreen({
  items,
  isLocked,
  isDefiner,
  showChecklist,
  checklistItems,
  pendingInvites,
  isRefreshing,
  onRefresh,
  onLoadMore,
  onReact,
  onComment,
  onPostPress,
  onEventPress,
  onInviteMore,
  onAddEvent,
  onAddToTree,
  onDismissChecklist,
}: FeedScreenProps) {
  const theme = useTheme();

  const handleShare = useCallback((text: string) => {
    void Share.share({ message: text });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: FeedItem }) => {
      if (item.type === "event") {
        return (
          <EventCard
            title={item.title}
            date={item.date}
            daysAway={item.daysAway}
            eventType={item.eventType}
            onPress={() => {
              onEventPress(item.id);
            }}
          />
        );
      }

      return (
        <PostCard
          authorName={item.authorName}
          textContent={item.textContent}
          timeAgo={item.timeAgo}
          mediaUrls={item.mediaUrls}
          reactionCount={item.reactionCount}
          commentCount={item.commentCount}
          onReact={() => {
            onReact(item.id);
          }}
          onComment={() => {
            onComment(item.id);
          }}
          onShare={() => {
            handleShare(item.textContent);
          }}
          onPress={() => {
            onPostPress(item.id);
          }}
        />
      );
    },
    [onReact, onComment, onPostPress, onEventPress, handleShare],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <FlatList
        data={isLocked ? [] : items}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <>
            {isLocked && (
              <LockedFeedState
                pendingInvites={pendingInvites}
                onInviteMore={onInviteMore}
                onAddEvent={onAddEvent}
                onAddToTree={onAddToTree}
              />
            )}
            {isDefiner && showChecklist && (
              <SetupChecklist items={checklistItems} onDismiss={onDismissChecklist} />
            )}
          </>
        }
        ListEmptyComponent={
          isLocked ? null : (
            <Text style={[styles.empty, { color: theme.colors.text.tertiary }]}>
              No posts yet. Share your first moment!
            </Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 16,
  },
  empty: {
    textAlign: "center",
    fontSize: 15,
    marginTop: 40,
  },
});
