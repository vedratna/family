## 1. Error Boundary

- [x] 1.1 Create `web/src/components/ErrorBoundary.tsx` (class component with componentDidCatch)
- [x] 1.2 Friendly fallback UI: error message, Reload button
- [x] 1.3 Wrap App.tsx routes with ErrorBoundary
- [x] 1.4 Add component test (throw error → fallback renders)

## 2. 404 Page

- [x] 2.1 Create `web/src/pages/NotFoundPage.tsx`
- [x] 2.2 Add `path="*"` route in App.tsx pointing to NotFoundPage

## 3. Pagination

- [x] 3.1 Create `web/src/components/LoadMoreButton.tsx` with loading state
- [x] 3.2 FeedPage: maintain accumulatedItems state, append on load-more, use cursor from previous response
- [x] 3.3 PostDetailPage: same pattern for comments
- [x] 3.4 Add tests for LoadMoreButton

## 4. Permission Guards

- [x] 4.1 Create `web/src/lib/permissions.ts` with helpers: canDeletePost, canEditPost, canEditEvent, canDeleteEvent, canEditChore, canDeleteChore, canEditRelationship, canDeleteRelationship, canManageMembers
- [x] 4.2 Add unit tests for permissions.ts
- [x] 4.3 PostDetailPage: hide Delete unless `canDeletePost(role, post, activePersonId)`
- [x] 4.4 EventDetailPage: hide Delete + InlineEdit unless `canEditEvent`/`canDeleteEvent`
- [x] 4.5 ChoresPage: hide Delete unless `canDeleteChore`
- [x] 4.6 PersonPage: hide relationship Edit/Delete unless `canEditRelationship`/`canDeleteRelationship`
- [x] 4.7 MembersPage: hide Remove + role dropdown unless `canManageMembers`

## 5. Tree Visualization

- [x] 5.1 Update TreePage to compute node positions per generation row
- [x] 5.2 Render SVG overlay with lines for parent-child relationships
- [x] 5.3 Render horizontal lines for spouse pairs
- [x] 5.4 Group spouse pairs visually adjacent

## 6. Verification

- [x] 6.1 Lint, typecheck, all tests pass
- [x] 6.2 e2e-test.sh still passes
- [x] 6.3 Manual: throw error in a component → fallback shown
- [x] 6.4 Manual: navigate to /unknown → NotFoundPage shown
- [x] 6.5 Manual: family with > initial-page-size posts shows Load More
- [x] 6.6 Manual: log in as editor → Delete buttons hidden on posts not authored
- [x] 6.7 Manual: tree shows connecting lines
