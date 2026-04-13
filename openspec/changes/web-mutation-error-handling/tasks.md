## 1. Shared Utilities

- [ ] 1.1 Create `web/src/lib/error-utils.ts` with `formatErrorMessage(error: CombinedError): string`
- [ ] 1.2 Add unit tests for formatErrorMessage covering all known error codes (Activation, Permission, NotFound, UserAlreadyExists, Validation, generic)

## 2. Shared Components

- [ ] 2.1 Create `web/src/components/Loading.tsx` — simple spinner/text component
- [ ] 2.2 Create `web/src/components/QueryError.tsx` — error message + retry button using formatErrorMessage

## 3. Mutation Error Handling — Per Page

- [ ] 3.1 FeedPage — refactor existing createPost handler to use formatErrorMessage
- [ ] 3.2 PostDetailPage — addComment shows error
- [ ] 3.3 CalendarPage — createEvent shows error
- [ ] 3.4 EventDetailPage — rsvpEvent shows error (inline near RSVP buttons)
- [ ] 3.5 ChoresPage — createChore + completeChore show error
- [ ] 3.6 MembersPage — inviteMember shows error
- [ ] 3.7 PersonPage — createRelationship shows error
- [ ] 3.8 SettingsPage — updateFamilyTheme shows error
- [ ] 3.9 CreateFirstFamilyPage — refactor createFamily handler to use formatErrorMessage
- [ ] 3.10 LoginPage — verify register/userByPhone errors are handled (already partly done)

## 4. Query Error States — Per Page

- [ ] 4.1 FeedPage — show QueryError on feed/events fetch failure
- [ ] 4.2 PostDetailPage — show QueryError on post/comments fetch failure
- [ ] 4.3 CalendarPage — show QueryError on events fetch failure
- [ ] 4.4 CalendarMonthPage — show QueryError on events fetch failure
- [ ] 4.5 EventDetailPage — show QueryError on event/rsvps fetch failure
- [ ] 4.6 TreePage — show QueryError on tree fetch failure
- [ ] 4.7 PersonPage — show QueryError on relationships/members fetch failure
- [ ] 4.8 ChoresPage — show QueryError on chores fetch failure
- [ ] 4.9 MembersPage — show QueryError on members fetch failure
- [ ] 4.10 SettingsPage — show QueryError if any query fails

## 5. Verification

- [ ] 5.1 Lint, typecheck pass
- [ ] 5.2 All existing tests pass (no regressions)
- [ ] 5.3 Unit tests for formatErrorMessage pass
- [ ] 5.4 Manual: trigger an ActivationGateError in browser → friendly message shown
- [ ] 5.5 e2e-test.sh still passes (no API changes here)
