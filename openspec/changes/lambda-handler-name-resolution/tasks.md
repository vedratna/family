## 1. Shared Enrichment Helper

- [x] 1.1 Create `handlers/_shared/enrichment.ts` exporting `PersonNameResolver` class with per-instance cache and `getName(familyId, personId)` method
- [x] 1.2 Add helpers `enrichPosts(posts, familyId, ...)`, `enrichComments(comments, familyId, ...)`, `enrichReactions(reactions, familyId, ...)`, `enrichEvents(events, familyId, ...)`, `enrichRSVPs(rsvps, familyId, ...)`
- [x] 1.3 Add unit tests for PersonNameResolver (caches per-family, returns "System" for personId="system", returns "Unknown" for missing person)

## 2. Feed Handler Enrichment

- [x] 2.1 Update `handlers/feed/handler.ts` — instantiate PersonNameResolver per invocation
- [x] 2.2 `familyFeed` enriches each post with authorName, reactionCount, commentCount
- [x] 2.3 `postDetail` enriches the post with authorName, reactionCount, commentCount
- [x] 2.4 `postComments` enriches each comment with personName (look up post → familyId)
- [x] 2.5 `postReactions` enriches each reaction with personName

## 3. Calendar Handler Enrichment

- [x] 3.1 Update `handlers/calendar/handler.ts` — instantiate PersonNameResolver per invocation
- [x] 3.2 `familyEvents` enriches each event with creatorName
- [x] 3.3 `eventDetail` enriches with creatorName
- [x] 3.4 `eventRSVPs` looks up event → familyId, then enriches each RSVP with personName

## 4. Family Handler — myFamilies Includes personId

- [x] 4.1 Update `myFamilies` resolver in `handlers/family/handler.ts` to include `personId` from membership in each FamilyWithRole entry

## 5. Tests

- [x] 5.1 Update feed handler tests to assert authorName, reactionCount, commentCount
- [x] 5.2 Update feed handler tests to assert personName on comments/reactions
- [x] 5.3 Update calendar handler tests to assert creatorName, personName on RSVPs
- [x] 5.4 Update family handler test to assert myFamilies returns personId

## 6. Verification

- [x] 6.1 Lint, typecheck, all tests pass
- [x] 6.2 e2e-test.sh still passes (uses local server, not AppSync — sanity check)
- [x] 6.3 (Optional) cdk synth still works with no schema regression
