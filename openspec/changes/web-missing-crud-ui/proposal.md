## Why

The web app has GraphQL mutations defined for edit/delete operations but no UI exposes them. Users can create posts but not delete them. Can RSVP to events but not edit or delete them. Can invite members but not remove them or change roles. Can add reactions but not remove them. The mutations exist; only the buttons are missing.

## What Changes

**Posts:**

- Delete post button on author's own posts (FeedPage cards + PostDetailPage)
- Reaction toggle on each post (add if not reacted, remove if reacted)
- Show clearly which reactions the current user has added

**Events:**

- Edit event inline (click title/description/date to edit, save on blur or with explicit save button) on EventDetailPage
- Delete event button on EventDetailPage (creator only)
- RSVP buttons should highlight the current user's selection

**Chores:**

- Add `deleteChore` mutation to schema + local server (currently missing entirely)
- Edit chore inline on chore card
- Delete chore button
- Filter tabs: All / Pending / Completed / Overdue
- Add description, recurrence, rotation fields to create form

**Relationships:**

- Edit relationship inline (labels, type) on PersonPage
- Delete relationship button

**Members:**

- Remove member button (admin/owner only, with confirmation)
- Change role dropdown (admin/owner only)

**Reusable confirm modal:**

- Build `web/src/components/ConfirmModal.tsx`
- Used for all destructive actions (delete post/event/chore/relationship, remove member)
- Pattern: title, message, confirm button (red), cancel button

**Inline editing pattern:**

- Build `web/src/components/InlineEdit.tsx` for text fields
- Click to enter edit mode, Enter or blur to save, Escape to cancel
- Use across posts, events, chores, relationships

## Capabilities

### New Capabilities

- `web-confirm-modal`: Reusable modal component for destructive action confirmations
- `web-inline-edit`: Reusable inline edit component for click-to-edit text fields

### Modified Capabilities

- `crud-forms`: Add edit/delete UI for all entities; reaction toggle on posts; member role/remove actions
- `graphql-api-complete`: Add `deleteChore` mutation (currently missing from schema)

## Impact

- **New files**: `web/src/components/ConfirmModal.tsx`, `web/src/components/InlineEdit.tsx`
- **Schema change**: add `deleteChore(familyId: ID!, choreId: ID!): Boolean!` to mutations
- **Local server**: add `deleteChore` resolver
- **Modified files**: FeedPage, PostDetailPage, CalendarPage, EventDetailPage, ChoresPage, MembersPage, PersonPage, SettingsPage, graphql-operations.ts, hooks.ts
- **Prerequisite**: `web-mutation-error-handling` (so new buttons show errors properly)
