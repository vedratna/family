## Summary
<!-- 1-3 bullet points describing what this PR does -->

## Checklist
- [ ] Follows layer boundaries (handler → use case → repo)
- [ ] Input validated at API boundary with Zod
- [ ] Permissions checked before business logic
- [ ] DynamoDB access pattern documented (if new)
- [ ] Error cases use typed domain errors
- [ ] Tests cover happy path AND edge cases
- [ ] No business logic in Lambda handlers or React screens
- [ ] No defensive code patterns
- [ ] No dead code (unused imports, commented-out blocks)
- [ ] All CI gates pass

## Test Plan
<!-- How to verify this works -->
