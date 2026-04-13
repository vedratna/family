## Context

The `web-fix-name-resolution` change extended the GraphQL schema with resolved-name fields (`authorName`, `personName`, `creatorName`) and aggregate count fields (`reactionCount`, `commentCount`), and implemented field resolvers in the local server using a per-request cache. Lambda handlers (production AppSync) were intentionally deferred. Now we close that gap.

The local server uses Apollo Server's field resolvers — when GraphQL processes a `Post` with selection `authorName`, it invokes `Post.authorName` resolver if defined. The handler returns just the raw post; field resolution adds the rest.

AppSync has different mechanics. Each operation maps to a Lambda data source (or DynamoDB, etc.). When AppSync gets `{ familyFeed { items { authorName } } }`, it invokes the feed Lambda for `familyFeed`. The Lambda returns the data. AppSync then maps fields by name. There is no built-in equivalent to "Post.authorName resolver" — the Lambda must include `authorName` in its response.

## Goals / Non-Goals

**Goals:**

- Lambda handlers return enriched payloads with all schema-required fields populated
- Match local server output exactly so clients work identically against AppSync or local
- Maintain per-request caching to avoid N+1 lookups on hot paths (feed)
- All existing handler unit tests still pass; new tests assert enriched fields

**Non-Goals:**

- AppSync pipeline resolvers (more complex, not needed)
- AppSync JavaScript resolvers (extra runtime dependency)
- Refactoring local server to share code with handlers (see Decision 2)

## Decisions

### 1. Enrich at Handler Boundary

**Decision:** Each handler that returns Post/Comment/Reaction/Event/EventRSVP enriches the response object before returning. The enriched fields are added by the handler itself.

```typescript
async function handleFamilyFeed(event) {
  const result = await getFamilyFeed.execute({ familyId, limit, cursor });
  const enriched = await enrichPosts(result.items, familyId);
  return { items: enriched, cursor: result.cursor };
}
```

**Rationale:** AppSync delivers the raw object as the source for nested field resolution. If the field is already present, AppSync uses it. So enriching at the handler covers all cases.

### 2. Shared Helper Module (Not Shared Code with Local Server)

**Decision:** Create `handlers/_shared/enrichment.ts` with `enrichPosts`, `enrichComments`, `enrichReactions`, `enrichEvents`, `enrichRSVPs` functions plus a per-call PersonNameResolver (cache).

The local server has its own Context-based cache. We don't try to share code because the lifecycle differs (per-request vs per-Lambda-invocation, but Lambdas reuse warm containers). Each Lambda invocation gets a fresh cache.

```typescript
// _shared/enrichment.ts
export class PersonNameResolver {
  private cache = new Map<string, Map<string, string>>();
  constructor(private personRepo: IPersonRepository) {}
  async getName(familyId: string, personId: string): Promise<string> { ... }
}

export async function enrichPosts(
  posts: Post[],
  familyId: string,
  resolver: PersonNameResolver,
  reactionRepo: IReactionRepository,
  commentRepo: ICommentRepository,
): Promise<EnrichedPost[]> { ... }
```

**Rationale:** Lambda handlers are domain-grouped; each domain instantiates the resolver/enricher with the repos it already has. Sharing across handler files via `_shared/` is the established pattern.

### 3. Per-Field Counts vs Single Aggregate Query

**Decision:** Enrichment makes a query per post for reactionCount/commentCount. For the feed (max 50 posts), that's ~100 extra queries. Acceptable for v1 (Lambda concurrency handles it; DynamoDB scales).

For production at scale, denormalize counts onto Post itself (update on add/remove). Document as future work.

### 4. CommentName/ReactionName Need familyId

**Problem:** `Comment.personName` resolution needs the family ID, but Comments are stored under POST# partition.

**Solution:** Each handler call has the familyId from the query args (e.g., `familyFeed(familyId)`). Pass it through to the enrichment helper. For `postComments(postId)`, the handler must look up the post first to get familyId. Cache the lookup.

### 5. EventRSVPs Need familyId Too

**Same approach:** `eventRSVPs(eventId)` handler looks up the event first, gets familyId, passes it to the enricher.

### 6. Tests

**Decision:** Update existing handler unit tests to assert new fields. Mock the personRepo to return known names. Verify enrichment helper logic in isolation with unit tests.

Add a single integration test that calls a real Lambda handler against DynamoDB Local and asserts enriched output. (Or skip — the local server already validates this end-to-end via e2e-test.sh, and the handler logic mirrors it.)

## Risks / Trade-offs

**[N+1 on counts]** → ~100 extra DynamoDB queries per feed render. Acceptable. Future denormalization documented.

**[Code duplication local-server vs handlers]** → Two implementations of the same field-resolution logic. Acceptable because lifecycles and frameworks differ; a single abstraction would over-engineer for one repeat.

**[Handler test count grows]** → Each handler gets 2-4 new test cases. Worth it for confidence.
