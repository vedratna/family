## Why

10+ mutations across the web app silently swallow errors. When `createPost`, `createEvent`, `createChore`, `inviteMember`, `rsvpEvent`, `completeChore`, `addComment`, `createRelationship`, `updateFamilyTheme`, etc. fail, the form just closes with no feedback. Users are left wondering whether anything happened. This was the user's exact complaint: "feed post is not working" — the post was actually rejected by the activation gate, but the UI gave no indication.

## What Changes

**Standardize mutation error handling across all pages:**

- Every mutation `.then()` callback checks `result.error` first
- If error: display friendly message in the form, keep form open with input intact
- Friendly message rules:
  - `ActivationGateError` / "at least 2 members" → "Invite at least one more member before posting/creating."
  - `PermissionDeniedError` → "You don't have permission to do this."
  - `NotFoundError` → "Item not found. It may have been deleted."
  - `ValidationError` → show the validation message verbatim
  - Other errors: show the message verbatim, stripped of `[GraphQL]` prefix
- If success: clear form, close it, refetch relevant data (already happens)

**Add error display to all query-driven pages:**

- When a query returns an error (`result.error`), pages currently get stuck on "Loading..." forever
- Each page should have an error state that shows the error and offers a retry button

**Reusable error helper:**

- Create `lib/error-utils.ts` with `formatErrorMessage(combinedError)` that maps domain error codes to friendly text
- Used by every mutation handler

**Pages affected (mutations needing fix):**

FeedPage (createPost — already done as a sample), PostDetailPage (addComment), CalendarPage (createEvent), EventDetailPage (rsvpEvent), ChoresPage (createChore, completeChore), MembersPage (inviteMember), PersonPage (createRelationship), SettingsPage (updateFamilyTheme), CreateFirstFamilyPage (already done)

**Pages affected (query error states):**

FeedPage, PostDetailPage, CalendarPage, CalendarMonthPage, EventDetailPage, TreePage, PersonPage, ChoresPage, MembersPage, SettingsPage

## Capabilities

### Modified Capabilities

- `crud-forms`: All mutation forms now display errors with friendly messages instead of silently closing
- `web-feature-screens`: All pages display query errors with retry option instead of being stuck on loading

## Impact

- **New files**: `web/src/lib/error-utils.ts`, possibly `web/src/components/ErrorState.tsx`
- **Modified files**: All web pages (~10 files), small per-page additions of error state
- **No schema or backend changes**
