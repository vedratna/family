## 1. Schema Changes

- [x] 1.1 Add `authorName: String!`, `reactionCount: Int!`, `commentCount: Int!` to `Post` type
- [x] 1.2 Add `personName: String!` to `Comment` type
- [x] 1.3 Add `personName: String!` to `Reaction` type
- [x] 1.4 Add `creatorName: String!` to `Event` type
- [x] 1.5 Add `personName: String!` to `EventRSVP` type

## 2. Local Server — Per-Request Person Cache

- [x] 2.1 Update `Context` type to include `getPersonName(familyId, personId): Promise<string>` helper
- [x] 2.2 Implement personCache in the `context()` function (lazy load + per-family cache)
- [x] 2.3 Special case: `personId === "system"` returns "System"
- [x] 2.4 Unknown person returns "Unknown"

## 3. Local Server — Field Resolvers

- [x] 3.1 Add `Post.authorName` resolver using `ctx.getPersonName`
- [x] 3.2 Add `Post.reactionCount` resolver (queries reactionRepo)
- [x] 3.3 Add `Post.commentCount` resolver (queries commentRepo)
- [x] 3.4 Add `Comment.personName` resolver — looks up post → familyId → person
- [x] 3.5 Add `Reaction.personName` resolver — looks up post → familyId → person
- [x] 3.6 Add `Event.creatorName` resolver
- [x] 3.7 Add `EventRSVP.personName` resolver — looks up event → familyId → person

## 4. Local Server — Optimization

- [x] 4.1 Cache post lookups per-request (for Comment/Reaction resolvers that need familyId)
- [x] 4.2 Cache event lookups per-request (for EventRSVP resolver)

## 5. Web Client — Update Operations

- [x] 5.1 Update `FAMILY_FEED_QUERY` to select `authorName`, `reactionCount`, `commentCount`
- [x] 5.2 Update `POST_DETAIL_QUERY` to select `authorName`, `reactionCount`, `commentCount`
- [x] 5.3 Update `POST_COMMENTS_QUERY` to select `personName`
- [x] 5.4 Update `POST_REACTIONS_QUERY` to select `personName`
- [x] 5.5 Update `FAMILY_EVENTS_QUERY` to select `creatorName`
- [x] 5.6 Update `EVENT_DETAIL_QUERY` to select `creatorName`
- [x] 5.7 Update `EVENT_RSVPS_QUERY` to select `personName`

## 6. Web Pages — Use Resolved Names

- [x] 6.1 FeedPage: replace `authorPersonId` with `authorName`; use real `reactionCount`/`commentCount`
- [x] 6.2 PostDetailPage: replace `authorPersonId` with `authorName`; comments use `personName`; reactions use `personName`
- [x] 6.3 EventDetailPage: show `creatorName`; RSVPs use `personName`
- [x] 6.4 CalendarPage: show `creatorName` on event cards (optional polish)

## 7. Web — API-Mode Feed Includes Events

- [x] 7.1 In FeedPage, also fetch `familyEvents` (date range: today to +90 days) in API mode
- [x] 7.2 Merge posts + upcoming events client-side, sorted by date
- [x] 7.3 Verify event cards still link to event detail page

## 8. Tests & Verification

- [x] 8.1 Update `scripts/e2e-test.sh` to assert names appear (e.g., grep for "Mickey Mouse" in feed response)
- [x] 8.2 Add e2e assertion: `reactionCount > 0` for a known post in seed data
- [x] 8.3 Add e2e assertion: `commentCount > 0` for a known post in seed data
- [x] 8.4 Add e2e assertion: event RSVPs return person names
- [x] 8.5 Lint, typecheck pass
- [x] 8.6 All existing unit tests still pass (no regression)
- [x] 8.7 Manual: open browser, verify FeedPage shows names not IDs, counts are real numbers, events appear in feed
