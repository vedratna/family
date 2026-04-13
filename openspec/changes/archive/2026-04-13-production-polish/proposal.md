## Why

Audit gaps deferred from the 4 web polish changes. Required for "best UI/UX experience" before production:

- **Global error boundary** — any uncaught component error currently crashes to a white screen
- **404 page** — bad URLs render a blank content area
- **Pagination** — feed and comments support cursors in schema but pages never load more; with real usage, old content becomes invisible
- **Hide-by-role** — every user sees Edit/Delete buttons even when they can't act on them; clicking gives a permission error. Cleaner to hide.
- **Tree visualization** — currently flat generation rows; adding parent-child connecting lines makes it readable
- **Empty states polish** — some pages show "No posts yet" but could guide better (e.g., "No posts yet — invite a member to start sharing")

## What Changes

**Global error boundary:**

- React error boundary at app root catches render errors
- Friendly fallback UI with "Reload" button
- Logs error to console (later: send to monitoring)

**404 page:**

- Catch-all route showing "Page not found" with link back to feed

**Pagination:**

- FeedPage: "Load more" button uses cursor from previous page
- PostDetailPage: same for comments
- Append items to existing list, don't refetch from start

**Hide-by-role:**

- FamilyProvider already exposes `activeRole` and `activePersonId`
- Helper `canEditPost(activeRole, post.authorPersonId, activePersonId)` returns boolean
- Pages use it to conditionally render Edit/Delete buttons
- Same logic for events (creator + admin), relationships (admin), members (admin)
- Permission checks remain on server — UI just hides what user can't do

**Tree visualization:**

- Add SVG/CSS connecting lines between parents and children
- Sibling-spouse pairs visually grouped
- Multi-spouse rendering (currently only first spouse shown)

**Empty states:**

- Pass useful next-action hints based on context (e.g., zero members → "Invite someone")

## Capabilities

### New Capabilities

- `error-boundary`: Top-level React error boundary with friendly fallback UI
- `pagination-ui`: Load-more pattern for paginated lists (feed, comments)

### Modified Capabilities

- `web-feature-screens`: Tree visualization improved, edit/delete buttons hidden by role, empty states polished
- `web-app-shell`: 404 route added

## Impact

- **New files**: `web/src/components/ErrorBoundary.tsx`, `web/src/components/LoadMoreButton.tsx`, `web/src/pages/NotFoundPage.tsx`, `web/src/lib/permissions.ts` (canEdit/canDelete helpers)
- **Modified files**: App.tsx (error boundary wrapper, 404 route), TreePage.tsx (visualization), most feature pages (hide-by-role guards), FeedPage/PostDetailPage (pagination)
- **No backend changes**
- **Prerequisite**: none (can be done independently)
