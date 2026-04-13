## Why

The `web-fix-name-resolution` change extended the GraphQL schema with `authorName`, `personName`, `creatorName`, `reactionCount`, and `commentCount` fields, and added field resolvers in the local server. But the Lambda handlers (production AppSync) were not updated. Result: the local dev stack returns resolved names; production AppSync returns raw IDs and the client breaks. This blocks deployment.

## What Changes

Mirror the local server's field resolution in Lambda handlers so AppSync-backed clients see the same data shape as the local-server-backed clients.

**Three options for AppSync field resolvers:**

1. **Pipeline resolvers (per field):** AppSync supports JS resolvers that can call other resolvers. Each field gets its own pipeline.
2. **Single Lambda handler with field resolution:** Each domain Lambda handles both the "primary" query AND field-level resolutions. The handler's switch detects which field is being resolved.
3. **Enrich at handler level (simpler):** Each handler that returns Posts/Comments/etc. enriches the response server-side before returning, so AppSync passes the enriched object through.

**Decided in design:** Option 3. The feed Lambda already returns Post objects — it can include `authorName` etc. directly in the response. AppSync just maps fields. No new pipeline complexity.

**Per-handler updates:**

- feed handler: Post returns include authorName, reactionCount, commentCount. Comment returns include personName. Reaction returns include personName.
- calendar handler: Event returns include creatorName. EventRSVP returns include personName.
- family handler: FamilyWithRole returns include personId (already done in schema).

**Shared helper:**

- `handlers/_shared/person-cache.ts` — same per-request cache pattern as local server, callable from each handler.

## Capabilities

### Modified Capabilities

- `lambda-handlers`: Handlers now enrich responses with resolved names and aggregate counts, matching the local server's behavior

## Impact

- **Modified files**: `handlers/feed/handler.ts`, `handlers/calendar/handler.ts`, `handlers/family/handler.ts`
- **New files**: `handlers/_shared/person-cache.ts` (or extract resolution helper)
- **No schema changes** (already done in earlier change)
- **Tests**: extend handler unit tests to assert enriched fields are present
- **Prerequisite**: none (the work is purely additive)
- **Unblocks**: cognito-auth-integration → production deploy
