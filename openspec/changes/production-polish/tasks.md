## 1. Error Boundary

- [ ] 1.1 Create `web/src/components/ErrorBoundary.tsx` (class component with componentDidCatch)
- [ ] 1.2 Friendly fallback UI: error message, Reload button
- [ ] 1.3 Wrap App.tsx routes with ErrorBoundary
- [ ] 1.4 Add component test (throw error → fallback renders)

## 2. 404 Page

- [ ] 2.1 Create `web/src/pages/NotFoundPage.tsx`
- [ ] 2.2 Add `path="*"` route in App.tsx pointing to NotFoundPage

## 3. Pagination

- [ ] 3.1 Create `web/src/components/LoadMoreButton.tsx` with loading state
- [ ] 3.2 FeedPage: maintain accumulatedItems state, append on load-more, use cursor from previous response
- [ ] 3.3 PostDetailPage: same pattern for comments
- [ ] 3.4 Add tests for LoadMoreButton

## 4. Permission Guards

- [ ] 4.1 Create `web/src/lib/permissions.ts` with helpers: canDeletePost, canEditPost, canEditEvent, canDeleteEvent, canEditChore, canDeleteChore, canEditRelationship, canDeleteRelationship, canManageMembers
- [ ] 4.2 Add unit tests for permissions.ts
- [ ] 4.3 PostDetailPage: hide Delete unless `canDeletePost(role, post, activePersonId)`
- [ ] 4.4 EventDetailPage: hide Delete + InlineEdit unless `canEditEvent`/`canDeleteEvent`
- [ ] 4.5 ChoresPage: hide Delete unless `canDeleteChore`
- [ ] 4.6 PersonPage: hide relationship Edit/Delete unless `canEditRelationship`/`canDeleteRelationship`
- [ ] 4.7 MembersPage: hide Remove + role dropdown unless `canManageMembers`

## 5. Tree Visualization

- [ ] 5.1 Update TreePage to compute node positions per generation row
- [ ] 5.2 Render SVG overlay with lines for parent-child relationships
- [ ] 5.3 Render horizontal lines for spouse pairs
- [ ] 5.4 Group spouse pairs visually adjacent

## 6. Verification

- [ ] 6.1 Lint, typecheck, all tests pass
- [ ] 6.2 e2e-test.sh still passes
- [ ] 6.3 Manual: throw error in a component → fallback shown
- [ ] 6.4 Manual: navigate to /unknown → NotFoundPage shown
- [ ] 6.5 Manual: family with > initial-page-size posts shows Load More
- [ ] 6.6 Manual: log in as editor → Delete buttons hidden on posts not authored
- [ ] 6.7 Manual: tree shows connecting lines
