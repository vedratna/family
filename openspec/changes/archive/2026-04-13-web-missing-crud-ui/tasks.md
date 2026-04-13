## 1. Backend — DeleteChore

- [x] 1.1 Add `deleteChore(familyId: ID!, choreId: ID!): Boolean!` mutation to schema
- [x] 1.2 Create `DeleteChore` use case (`use-cases/chores/delete-chore.ts`) wrapping `choreRepo.delete` with role check
- [x] 1.3 Export DeleteChore from `use-cases/chores/index.ts`
- [x] 1.4 Add `deleteChore` resolver to local server
- [x] 1.5 Add unit test for DeleteChore use case
- [x] 1.6 Add Lambda handler routing for `deleteChore` (matches handlers pattern)

## 2. Shared Components

- [x] 2.1 Create `web/src/components/ConfirmModal.tsx` with backdrop + card + Cancel/Confirm
- [x] 2.2 Create `web/src/components/InlineEdit.tsx` with click-to-edit, Enter save, Escape cancel, blur save
- [x] 2.3 Add component tests for ConfirmModal (open/closed, confirm/cancel)
- [x] 2.4 Add component tests for InlineEdit (click → edit, Enter save, Escape cancel)

## 3. FamilyProvider — Expose activePersonId

- [x] 3.1 Add query that resolves the current user's personId in the active family
- [x] 3.2 Expose `activePersonId` on FamilyContextValue (undefined if user has no person yet)

## 4. Web GraphQL Operations + Hooks

- [x] 4.1 Add `DELETE_CHORE_MUTATION` to graphql-operations.ts
- [x] 4.2 Add `useDeleteChore` hook
- [x] 4.3 Verify other delete/edit hooks already exist (deletePost, deleteEvent, editEvent, removeMember, updateMemberRole, addReaction, removeReaction, editRelationship, deleteRelationship)

## 5. FeedPage / PostDetailPage — Post Actions

- [x] 5.1 Add Delete button on PostDetailPage with ConfirmModal → `deletePost` → navigate to /feed
- [x] 5.2 Add reaction toggle (heart) on PostDetailPage; track current user's reaction via `personId` match against activePersonId; toggle calls add/removeReaction; refetch on success

## 6. EventDetailPage — Event Actions

- [x] 6.1 Wrap event title in InlineEdit → `editEvent` mutation (passing existing event fields + new title)
- [x] 6.2 Wrap event location in InlineEdit (optional field — show "Add location" if empty)
- [x] 6.3 Wrap event description in InlineEdit (multiline)
- [x] 6.4 Add Delete button with ConfirmModal → `deleteEvent` → navigate to /calendar
- [x] 6.5 Highlight current user's RSVP selection (compare personName/personId from rsvps with currentUser)

## 7. ChoresPage — Filter + Delete

- [x] 7.1 Add filter tab bar: All / Pending / Completed / Overdue
- [x] 7.2 Filter displayed chores based on selected tab
- [x] 7.3 Add Delete button on each chore with ConfirmModal → `deleteChore` → refetch
- [x] 7.4 (Defer) Inline edit chore title — needs `editChore` mutation, not adding here

## 8. PersonPage — Relationship Actions

- [x] 8.1 Add Delete button on each relationship with ConfirmModal → `deleteRelationship` → refetch
- [x] 8.2 Wrap aToBLabel and bToALabel in InlineEdit → `editRelationship` mutation

## 9. MembersPage — Member Actions

- [x] 9.1 Add Remove button on each member with ConfirmModal → `removeMember` → refetch
- [x] 9.2 Add role dropdown on each member (owner/admin/editor/viewer) → `updateMemberRole` → refetch

## 10. Verification

- [x] 10.1 Lint, typecheck, tests pass
- [x] 10.2 e2e-test.sh extended: deleteChore works, post can be deleted, event can be edited
- [x] 10.3 Manual: delete a post in browser → ConfirmModal → confirm → post gone
- [x] 10.4 Manual: react/un-react on a post → heart toggles, count updates
- [x] 10.5 Manual: edit an event title inline → saves
- [x] 10.6 Manual: filter chores by status → list updates
- [x] 10.7 Manual: change a member's role → updates
