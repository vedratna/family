## Context

Five UX/quality gaps deferred from the four web polish changes. Each is small in isolation; bundling them keeps PR overhead reasonable while shipping noticeable improvements.

## Goals / Non-Goals

**Goals:**

- App never white-screens on errors (global ErrorBoundary)
- 404 page for unknown routes
- Feed and comments paginate (no more endless scroll of stale data)
- Edit/delete buttons hidden from users who can't act on them
- Tree visualization shows parent-child connecting lines

**Non-Goals:**

- Toast notification system
- Skeleton loaders (Loading component is sufficient)
- Drag-to-reorder, undo
- Full design system / component library refactor

## Decisions

### 1. Error Boundary at App Root

**Decision:** Single ErrorBoundary class component wrapping the entire route tree. On `componentDidCatch`, log to console and render a friendly fallback with Reload button.

```tsx
<ErrorBoundary>
  <BrowserRouter>...</BrowserRouter>
</ErrorBoundary>
```

**Rationale:** Simpler than per-route boundaries. The granularity isn't worth the complexity for v1. Future: per-route boundaries with feature-specific fallback messages.

### 2. 404 Page

**Decision:** Route `*` to `<NotFoundPage>` with friendly message and link to /feed.

### 3. Pagination Pattern

**Decision:** "Load More" button at the bottom of paginated lists. Click adds the next page's items to the existing list. No infinite scroll (more accessible, less surprising).

For FeedPage: maintain `accumulatedItems` state. When user clicks Load More, fetch next page using cursor, append.

For PostDetailPage comments: same pattern.

**Rationale:** Cursor pagination already in schema. Load-more is the simplest UX for the user-experienced rate of new content (low to moderate). Infinite scroll requires intersection observer + scroll restoration; overkill.

### 4. Permission Helpers

**Decision:** Create `lib/permissions.ts` with pure functions:

```typescript
export function canDeletePost(role, post, activePersonId): boolean {
  return post.authorPersonId === activePersonId || role === "admin" || role === "owner";
}
export function canEditEvent(role, event, activePersonId): boolean { ... }
export function canManageMembers(role): boolean {
  return role === "admin" || role === "owner";
}
// etc.
```

Pages use these to conditionally render buttons. Server enforcement remains; this just polishes the UI.

### 5. Tree Visualization with SVG Lines

**Decision:** Render the existing generation rows as before, but draw SVG lines between parents and children using the relationships data.

Approach:

1. Calculate node positions (x, y) based on generation row + index
2. For each parent-child relationship in the family, draw a line from parent's bottom to child's top
3. For spouse pairs, draw a horizontal line connecting them

Use absolute positioning + an SVG overlay matching the container size.

**Rationale:** Real tree libraries (d3-org-chart, react-flow) are heavy and opinionated. SVG lines on top of existing layout is sufficient for v1.

**Trade-off:** Lines are static (no zoom/pan, no auto-layout). For complex families this becomes cluttered. Acceptable for v1.

## Risks / Trade-offs

**[ErrorBoundary catches all errors as same]** — no per-route customization. Acceptable.

**[Pagination state resets on navigation]** — going to /feed/:postId then back to /feed reloads the first page. urql cache may help. If awful, revisit with a "remember scroll position" enhancement.

**[Permission helpers can drift from server]** — if backend rules change (e.g., editor can delete own posts), helpers must update too. Document this. The server enforcement is the source of truth; UI is for UX only.

**[SVG line rendering at scale]** — for 50+ nodes, performance may degrade. Acceptable for typical family sizes (<30).
