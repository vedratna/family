## Context

The 2026-04-13 audit identified that many GraphQL mutations are defined and exported as hooks but no UI exposes them: `deletePost`, `deleteEvent`, `editEvent`, `removeMember`, `updateMemberRole`, `addReaction`, `removeReaction`, `editRelationship`, `deleteRelationship`. Also `deleteChore` doesn't exist anywhere yet (not in schema, not as a hook, not in UI). Users can create things but can't edit or delete them, and can't react to posts.

The user's preferences from earlier: **inline editing** (click-to-edit, not modal), **modal confirmations** for destructive actions, keep activation gate as-is.

## Goals / Non-Goals

**Goals:**

- Reusable `ConfirmModal` for all destructive actions (consistent UX)
- Reusable `InlineEdit` for click-to-edit text fields (titles, descriptions)
- Add `deleteChore` mutation (schema + resolver + hook)
- Wire missing UI for: post delete, event edit/delete, chore edit/delete, relationship edit/delete, member remove/role-change, post reaction toggle
- Highlight current user's RSVP selection on EventDetail
- Filter tabs on ChoresPage: All / Pending / Completed / Overdue

**Non-Goals:**

- Notification preferences UI (separate change #4)
- Refactoring existing pages beyond adding new buttons/components
- Changing the schema for fields beyond `deleteChore`
- Adding edit forms for fields not already creatable (e.g., no "edit family name" since `updateFamilyName` doesn't exist)
- Drag-to-reorder, undo, bulk operations

## Decisions

### 1. ConfirmModal Component

**Decision:** Build a single `ConfirmModal` component used by every destructive action. It renders a portal-style overlay (fixed position, backdrop) with title, message, Cancel and Confirm buttons. Confirm is red-styled (destructive variant).

```typescript
interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string; // default "Delete"
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
```

**Rationale:** Native `window.confirm()` is ugly and inconsistent with the app's theme. A simple shared component gives consistent UX with no library dependency. Decided in audit.

### 2. InlineEdit Component

**Decision:** Build a `InlineEdit` component that renders display text by default; clicking switches to a controlled input. Save on Enter or blur, cancel on Escape.

```typescript
interface InlineEditProps {
  value: string;
  onSave: (next: string) => void | Promise<void>;
  multiline?: boolean; // textarea vs input
  placeholder?: string;
  className?: string;
  disabled?: boolean; // hide editing when user can't edit
}
```

**Rationale:** Matches user preference for inline edits. Encapsulates the edit/save/cancel state machine so each page just provides value + onSave.

### 3. Reaction Toggle on Posts

**Decision:** Each post card shows a heart button. If the current user has reacted, the heart is filled (toggle removes it). If not reacted, it's empty (toggle adds it).

To know if the current user has reacted, we need to fetch reactions for the post and check `personId === currentUserId`. For the FeedPage feed, this would be N+1 (one query per post). Acceptable for now since families are small (<50 posts typically). Document as future optimization.

For PostDetailPage, the reactions are already fetched.

For now, FeedPage shows the count and lets users tap into PostDetailPage to react. PostDetailPage gets the toggle button. **Defer feed-level reaction toggle** — out of scope unless trivial.

Updated decision: feed cards keep their current display. PostDetailPage gets the reaction toggle. This keeps the change scoped.

### 4. Edit/Delete Permissions

**Decision:** Show edit/delete buttons based on role and ownership rules:

| Action                      | Who can do it                                         |
| --------------------------- | ----------------------------------------------------- |
| Delete post                 | Author OR family admin/owner                          |
| Edit/Delete event           | Creator OR family admin/owner                         |
| Complete/Edit/Delete chore  | Anyone in family (no restriction in current use case) |
| Edit/Delete relationship    | Family admin/owner                                    |
| Remove member / Change role | Family admin/owner only                               |

The current user's role comes from `useFamily()` (we'll need to expose `activeRole` from FamilyProvider). For "is author/creator", compare current user's `userId` with the entity's `authorPersonId`/`creatorPersonId` after looking up the corresponding `Person.userId`.

**Simpler implementation:** Server already enforces permissions via use cases. If the UI shows the button to everyone, the server rejects unauthorized clicks with `PermissionDeniedError` — and we already show those errors thanks to #2. So we have two layers:

- **Always show edit/delete buttons** in this change (simpler)
- The mutation handler shows the friendly permission error if the user isn't allowed

This keeps UI logic simple. Hiding buttons by role is a polish item for later.

### 5. Schema Change: `deleteChore`

**Decision:** Add to `schema.graphql`:

```graphql
deleteChore(familyId: ID!, choreId: ID!): Boolean!
```

Add resolver to `local-server/index.ts` that calls `choreRepo.delete(familyId, choreId)`. The use case layer doesn't have a `DeleteChore` use case yet — we'll either add one (canonical) or call the repo directly (faster).

Decided: call the repo directly. The semantics are simple (delete by id), no business logic needed (similar to how `deletePost` works through DeletePost use case but `eventRepo.delete` is called directly in some flows). Document this consistency tradeoff.

Actually, **more consistent:** add a `DeleteChore` use case that wraps `choreRepo.delete` and takes the requesterRole for permission checking. This matches the pattern of other mutations. Small file but worth it for consistency.

### 6. Chore Filter Tabs

**Decision:** Add a simple tab bar above the chore list with: All / Pending / Completed / Overdue. Selected tab filters the displayed chores. State stored in `useState`. No URL change.

### 7. RSVP Selection Highlight

**Decision:** Pass current user's existing RSVP status to EventDetailPage, highlight the matching button (e.g., colored background, checkmark). Use `currentUser.id` and look up via `eventRSVPs` query.

The RSVP query returns `{ personId, status, ... }`. For the current user's RSVP, find the entry where `personId === currentUserPersonId`. We need to know the current user's personId in the active family — that's `useFamily().activePerson?.id` if we expose it, or do a separate lookup.

**Simpler:** the current user's RSVP can be derived from the rsvps list by matching `personName === currentUser.displayName`. Brittle but works for now. Better: extend FamilyProvider to expose `activePersonId` (the current user's person record in the active family).

Decided: extend FamilyProvider to expose `activePersonId`. Compute it by joining `myFamilies` data with the user's identity. This also helps other places (e.g., showing "your post" indicator). Small addition.

## Risks / Trade-offs

**[Always-show buttons leak unauthorized actions]** — admins see Delete, non-admins also see Delete. Clicking shows permission error. Acceptable for v1; tighten later if it becomes confusing.

**[Inline edit on multi-line]** — Multiline auto-save on blur is okay but Enter normally adds newline. We'll need a save button for textareas. Keep input version simple, defer multiline polish.

**[N+1 on reaction toggle for feed]** — deferred. PostDetailPage only.

**[DeleteChore use case may be overkill]** — small file but adds consistency. Worth the tradeoff.
