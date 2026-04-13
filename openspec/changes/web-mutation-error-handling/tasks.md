## 1. Shared Utilities

- [x] 1.1 Create `web/src/lib/error-utils.ts` with `formatErrorMessage(error: CombinedError): string`
- [x] 1.2 Add unit tests for formatErrorMessage covering all known error codes (Activation, Permission, NotFound, UserAlreadyExists, Validation, generic)

## 2. Shared Components

- [x] 2.1 Create `web/src/components/Loading.tsx` — simple spinner/text component
- [x] 2.2 Create `web/src/components/QueryError.tsx` — error message + retry button using formatErrorMessage

## 3. Mutation Error Handling — Per Page

- [x] 3.1 FeedPage — refactor existing createPost handler to use formatErrorMessage
- [x] 3.2 PostDetailPage — addComment shows error
- [x] 3.3 CalendarPage — createEvent shows error
- [x] 3.4 EventDetailPage — rsvpEvent shows error (inline near RSVP buttons)
- [x] 3.5 ChoresPage — createChore + completeChore show error
- [x] 3.6 MembersPage — inviteMember shows error
- [x] 3.7 PersonPage — createRelationship shows error
- [x] 3.8 SettingsPage — updateFamilyTheme shows error
- [x] 3.9 CreateFirstFamilyPage — refactor createFamily handler to use formatErrorMessage
- [x] 3.10 LoginPage — verify register/userByPhone errors are handled (already partly done)

## 4. Query Error States — Per Page

- [x] 4.1 FeedPage — show QueryError on feed/events fetch failure
- [x] 4.2 PostDetailPage — show QueryError on post/comments fetch failure
- [x] 4.3 CalendarPage — show QueryError on events fetch failure
- [x] 4.4 CalendarMonthPage — show QueryError on events fetch failure
- [x] 4.5 EventDetailPage — show QueryError on event/rsvps fetch failure
- [x] 4.6 TreePage — show QueryError on tree fetch failure
- [x] 4.7 PersonPage — show QueryError on relationships/members fetch failure
- [x] 4.8 ChoresPage — show QueryError on chores fetch failure
- [x] 4.9 MembersPage — show QueryError on members fetch failure
- [x] 4.10 SettingsPage — show QueryError if any query fails

## 5. Verification

- [x] 5.1 Lint, typecheck pass
- [x] 5.2 All existing tests pass (no regressions)
- [x] 5.3 Unit tests for formatErrorMessage pass
- [x] 5.4 Manual: trigger an ActivationGateError in browser → friendly message shown
- [x] 5.5 e2e-test.sh still passes (no API changes here)
