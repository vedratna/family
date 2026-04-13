## Why

In API mode, the web app displays raw person IDs (`person-abc123`) wherever it should show person names. This affects the most-used social features: feed posts show authors as IDs, post comments show commenters as IDs, event RSVPs show attendees as IDs. The `FAMILY_FEED_QUERY`, `POST_COMMENTS_QUERY`, `POST_REACTIONS_QUERY`, `EVENT_RSVPS_QUERY`, and `POST_DETAIL_QUERY` all return only IDs, never names. The web app is fundamentally broken for social use until this is fixed.

## What Changes

**Schema-side resolution (decided approach):**

- Extend `Post` type to include `authorName: String!` (resolved from `authorPersonId`)
- Extend `Comment` type to include `personName: String!` (resolved from `personId`)
- Extend `Reaction` type to include `personName: String!` (resolved from `personId`)
- Extend `EventRSVP` type to include `personName: String!` (resolved from `personId`)
- Extend `Event` type to include `creatorName: String!` (resolved from `creatorPersonId`)

**Local server resolvers:**

- Add field resolvers (or nested resolution helpers) that look up person name by ID within the family
- Cache person lookups per-request to avoid N+1 queries

**Web app:**

- Update the GraphQL operation strings to select the new name fields
- Replace places that display `authorPersonId` / `personId` / `creatorPersonId` with the new name fields
- Show post timestamps consistently

**Reaction count + comment count on feed:**

- Extend `Post` type to include `reactionCount: Int!` and `commentCount: Int!` (decided here as a natural part of the same change since it has the same pattern: server-side field resolution)
- Update FeedPage to display real counts instead of hardcoded `0`

**Feed includes events:**

- API-mode feed should mix posts and upcoming events like mock mode does (currently API mode shows only posts)
- Either extend `familyFeed` to return a union, or fetch upcoming events alongside posts and merge client-side

## Capabilities

### New Capabilities

- `name-resolution`: Server-side resolution of person names alongside IDs in all social GraphQL types (Post, Comment, Reaction, Event, EventRSVP)

### Modified Capabilities

- `web-feature-screens`: Pages updated to display resolved names instead of raw IDs, and real reaction/comment counts
- `graphql-api-complete`: Schema extended with name fields and aggregate count fields on Post

## Impact

- **Modified files**: `infra/graphql/schema.graphql`, `backend/src/local-server/index.ts` (resolvers), `web/src/lib/graphql-operations.ts`, web pages (FeedPage, PostDetailPage, EventDetailPage)
- **Lambda handlers**: same schema applies to AppSync — handlers will also need updates (out of scope for now since prod isn't connected to clients yet; can be done in a follow-up)
- **Test data**: e2e-test.sh extended to assert names appear, not IDs
- **No changes to**: DynamoDB repos, use cases, mobile app
