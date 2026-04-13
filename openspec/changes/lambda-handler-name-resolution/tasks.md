## 1. Shared Enrichment Helper

- [ ] 1.1 Create `handlers/_shared/enrichment.ts` exporting `PersonNameResolver` class with per-instance cache and `getName(familyId, personId)` method
- [ ] 1.2 Add helpers `enrichPosts(posts, familyId, ...)`, `enrichComments(comments, familyId, ...)`, `enrichReactions(reactions, familyId, ...)`, `enrichEvents(events, familyId, ...)`, `enrichRSVPs(rsvps, familyId, ...)`
- [ ] 1.3 Add unit tests for PersonNameResolver (caches per-family, returns "System" for personId="system", returns "Unknown" for missing person)

## 2. Feed Handler Enrichment

- [ ] 2.1 Update `handlers/feed/handler.ts` — instantiate PersonNameResolver per invocation
- [ ] 2.2 `familyFeed` enriches each post with authorName, reactionCount, commentCount
- [ ] 2.3 `postDetail` enriches the post with authorName, reactionCount, commentCount
- [ ] 2.4 `postComments` enriches each comment with personName (look up post → familyId)
- [ ] 2.5 `postReactions` enriches each reaction with personName

## 3. Calendar Handler Enrichment

- [ ] 3.1 Update `handlers/calendar/handler.ts` — instantiate PersonNameResolver per invocation
- [ ] 3.2 `familyEvents` enriches each event with creatorName
- [ ] 3.3 `eventDetail` enriches with creatorName
- [ ] 3.4 `eventRSVPs` looks up event → familyId, then enriches each RSVP with personName

## 4. Family Handler — myFamilies Includes personId

- [ ] 4.1 Update `myFamilies` resolver in `handlers/family/handler.ts` to include `personId` from membership in each FamilyWithRole entry

## 5. Tests

- [ ] 5.1 Update feed handler tests to assert authorName, reactionCount, commentCount
- [ ] 5.2 Update feed handler tests to assert personName on comments/reactions
- [ ] 5.3 Update calendar handler tests to assert creatorName, personName on RSVPs
- [ ] 5.4 Update family handler test to assert myFamilies returns personId

## 6. Verification

- [ ] 6.1 Lint, typecheck, all tests pass
- [ ] 6.2 e2e-test.sh still passes (uses local server, not AppSync — sanity check)
- [ ] 6.3 (Optional) cdk synth still works with no schema regression
