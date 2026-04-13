## Context

The 2026-04-13 audit found 10+ mutations across the web app silently swallow errors. When `createPost`, `createEvent`, `createChore`, `inviteMember`, `rsvpEvent`, `completeChore`, `addComment`, `createRelationship`, `updateFamilyTheme`, etc. fail, the form just closes with no feedback. The user's exact frustration ("feed post is not working") came from the activation gate rejecting their post but no UI showing the error.

Similarly, query errors leave pages stuck on "Loading..." forever because the `if (data === null) loading` pattern doesn't distinguish "still fetching" from "failed".

## Goals / Non-Goals

**Goals:**

- Every mutation `.then()` callback checks `result.error` and shows a friendly message
- Every query-driven page shows an error state with retry option when fetch fails
- Friendly mapping for known domain error codes (ActivationGateError, PermissionDeniedError, NotFoundError, ValidationError)
- Forms keep their input intact on error so users don't lose their typing
- Single shared utility for error formatting (DRY)

**Non-Goals:**

- Toast notifications / global error overlay — keep errors local to the form/page
- Retry queues or optimistic updates — out of scope, errors are shown synchronously
- Server-side error logging changes — backend already throws domain errors with codes
- Reaction/edit/delete error handling — those buttons don't exist yet (will be done in #3 missing-crud-ui)

## Decisions

### 1. Centralized Error Formatter

**Decision:** Create `web/src/lib/error-utils.ts` with a single `formatErrorMessage(error)` function that maps urql `CombinedError` to a friendly string.

```typescript
export function formatErrorMessage(error: CombinedError): string {
  const raw = error.message.replace(/^\[GraphQL\] /, "");

  if (raw.includes("ActivationGateError") || raw.includes("at least 2")) {
    return "Invite at least one more member before posting or creating items.";
  }
  if (raw.includes("PermissionDeniedError") || raw.includes("PERMISSION_DENIED")) {
    return "You don't have permission to do this.";
  }
  if (raw.includes("NotFoundError") || raw.includes("NOT_FOUND")) {
    return "Item not found. It may have been deleted.";
  }
  if (raw.includes("UserAlreadyExistsError")) {
    return "An account with this phone number already exists.";
  }
  if (raw.includes("ValidationError") || raw.includes("VALIDATION_ERROR")) {
    return raw.replace(/^[A-Z_]+:\s*/, "");
  }
  // Default: strip the error class name prefix if present
  return raw.replace(/^[A-Z][A-Za-z]+Error:\s*/, "").replace(/^[A-Z_]+:\s*/, "");
}
```

**Rationale:** Single source of truth. Every page imports the same helper. Easy to extend with new error mappings.

### 2. Mutation Pattern (per-page)

**Decision:** Standardize the pattern across all pages:

```typescript
const [errorMsg, setErrorMsg] = useState<string | null>(null);

function handleSubmit(e) {
  e.preventDefault();
  setErrorMsg(null); // clear previous error
  if (!isApiMode()) {
    // mock mode: just close
    return;
  }
  void mutate({ ...vars }).then((result) => {
    if (result.error) {
      setErrorMsg(formatErrorMessage(result.error));
      return; // keep form open with input intact
    }
    refetch({ requestPolicy: "network-only" });
    closeForm();
    clearInput();
  });
}
```

In JSX:

```tsx
{
  errorMsg !== null && <p className="text-sm text-red-600">{errorMsg}</p>;
}
```

### 3. Query Error State Component

**Decision:** Create reusable `web/src/components/QueryError.tsx`:

```tsx
interface QueryErrorProps {
  error: CombinedError;
  onRetry: () => void;
}
export function QueryError({ error, onRetry }: QueryErrorProps) {
  return (
    <div className="p-6 text-center">
      <p className="text-sm text-red-600 mb-3">{formatErrorMessage(error)}</p>
      <button onClick={onRetry} className="px-4 py-2 ...">
        Retry
      </button>
    </div>
  );
}
```

Pages use it:

```tsx
if (queryResult.error)
  return (
    <QueryError
      error={queryResult.error}
      onRetry={() => reexecute({ requestPolicy: "network-only" })}
    />
  );
if (queryResult.fetching) return <Loading />;
```

### 4. Loading Component (small win)

**Decision:** Also extract `web/src/components/Loading.tsx` for consistency. Currently every page has its own "Loading..." text. One component = consistent UX.

```tsx
export function Loading({ label = "Loading..." }: { label?: string }) {
  return <p className="p-4 text-sm text-[var(--color-text-secondary)]">{label}</p>;
}
```

### 5. Pages Affected

**Mutation error handling (10 pages):**

- FeedPage (createPost — already has handler from earlier fix, refactor to use formatErrorMessage)
- PostDetailPage (addComment)
- CalendarPage (createEvent)
- EventDetailPage (rsvpEvent)
- ChoresPage (createChore, completeChore)
- MembersPage (inviteMember)
- PersonPage (createRelationship)
- SettingsPage (updateFamilyTheme, updateNotificationPreference — will be added in #4 but pattern goes here)
- CreateFirstFamilyPage (createFamily — already has handler, refactor)
- LoginPage (register, userByPhone — already has some handling, verify)

**Query error states (8 pages):**

- FeedPage, PostDetailPage, CalendarPage, CalendarMonthPage, EventDetailPage, TreePage, PersonPage, ChoresPage, MembersPage, SettingsPage

## Risks / Trade-offs

**[Errors in form-less mutations]** — e.g., a button click that triggers a mutation (RSVP, complete chore) doesn't have a form to attach an error to. Solution: show error inline near the button, fade out after a few seconds. Or use the page-level error state.

**[CombinedError type from urql]** — urql's `CombinedError` has both `graphQLErrors` (server-side) and `networkError` (transport). The formatter handles both via `error.message` which urql composes. Acceptable.

**[Error persistence]** — error state lives in component state, cleared on next attempt. Doesn't persist across navigation. Acceptable for inline errors.
