## Context

In API mode, the web app shows opaque IDs (e.g., `person-mickey`) where it should show display names (e.g., "Mickey Mouse"). The cause is straightforward: the GraphQL queries return only IDs, not names. Pages then display the ID directly because there's no client-side lookup.

The user decided we should fix this on the **schema side** — extend the GraphQL types so the server returns resolved names alongside IDs. Reasons: simpler page code (no lookup logic), single source of truth, and less risk of N+1 fetches scattered across pages.

While we're touching the schema for names, we'll also fix two related issues from the audit:

- `Post.reactionCount` and `Post.commentCount` are hardcoded to 0 in API mode (audit issue #9)
- API-mode feed only shows posts; events are missing (audit issue #10)

These three concerns share the same fix pattern (server-side aggregation/joining), so they belong in one change.

## Goals / Non-Goals

**Goals:**

- Display real person names everywhere (feed authors, comment authors, RSVP attendees, event creators, reactors)
- Display real reaction and comment counts in the feed
- API-mode feed includes upcoming events mixed with posts (matching mock-mode behavior)
- Keep mock mode working unchanged

**Non-Goals:**

- Updating Lambda handlers to match — they still return IDs only. Production deploy isn't connected to clients yet, so this is fine; will be a follow-up when we wire mobile/web to AppSync directly.
- Any backend repo changes
- Any new use cases or business logic
- Pagination of comments (audit issue #20) — separate change

## Decisions

### 1. Resolved-Name Fields (additive, non-breaking)

**Decision:** Add new fields to types alongside the existing ID fields. Don't replace IDs (some callers may still want them).

```graphql
type Post {
  id: ID!
  familyId: ID!
  authorPersonId: String!
  authorName: String!         # NEW
  textContent: String!
  isSystemPost: Boolean!
  createdAt: String!
  reactionCount: Int!         # NEW
  commentCount: Int!          # NEW
}

type Comment {
  id: ID!
  postId: ID!
  personId: String!
  personName: String!         # NEW
  textContent: String!
  createdAt: String!
}

type Reaction {
  postId: ID!
  personId: String!
  personName: String!         # NEW
  emoji: String!
  createdAt: String!
}

type Event {
  ...existing...
  creatorName: String!        # NEW (resolved from creatorPersonId + familyId)
}

type EventRSVP {
  eventId: ID!
  personId: String!
  personName: String!         # NEW
  status: String!
  updatedAt: String!
}
```

**Rationale:** Additive changes are safe. Existing clients (none in production yet) don't break. We can opt in field-by-field.

### 2. Resolution Strategy — Apollo Field Resolvers with Per-Request Cache

**Decision:** Implement field resolvers on the local server that look up person names. Use a per-request DataLoader-like cache to avoid N+1.

```typescript
// In local-server/index.ts
const resolvers = {
  Post: {
    authorName: async (post, _args, ctx) => {
      return ctx.personLoader.load(post.familyId, post.authorPersonId);
    },
    reactionCount: async (post) => {
      const reactions = await reactionRepo.getByPostId(post.id);
      return reactions.length;
    },
    commentCount: async (post) => {
      const result = await commentRepo.getByPostId(post.id, 1000);
      return result.items.length;
    },
  },
  Comment: {
    personName: async (comment, _args, ctx) => {
      // Need familyId — derive from post or pass through context
      return ctx.personLoader.loadByPersonId(comment.personId);
    },
  },
  // ... similar for Reaction, Event, EventRSVP
};
```

**Per-request cache implementation:**

```typescript
// context() function
context: async ({ req }) => {
  const userId = req.headers['x-user-id'];
  // Lazy person cache: familyId → Map<personId, personName>
  const personCache = new Map<string, Map<string, string>>();
  return {
    userId,
    getPersonName: async (familyId: string, personId: string) => {
      if (personId === 'system') return 'System';
      let famCache = personCache.get(familyId);
      if (!famCache) {
        const persons = await personRepo.getByFamilyId(familyId);
        famCache = new Map(persons.map(p => [p.id, p.name]));
        personCache.set(familyId, famCache);
      }
      return famCache.get(personId) ?? 'Unknown';
    },
  };
},
```

**Rationale:** Resolving names lazily and caching per-request keeps the hot path fast. Most pages query a single family at a time, so we fetch all persons once and reuse.

### 3. Comment.personName — Need familyId

**Problem:** `Comment.personName` resolution needs the family to look up persons. But comments are stored under `POST#<postId>` and don't carry familyId.

**Decision:** Look up the post first to get its familyId, then resolve the person name. Add this lookup to the comment resolver. Cache the post too.

Alternative considered: include familyId on Comment items in DynamoDB. Rejected — would require migrating existing data and changing the repo. The lookup is fast and cached.

### 4. Reaction.personName — Same problem

**Same approach:** look up the post → familyId → person name. Cache.

### 5. Feed Includes Events — Server-Side Merge

**Decision:** Don't change `familyFeed` (still posts only). Add a new query `familyFeedWithEvents(familyId, limit?)` that returns a union-like type or a single typed envelope. Pages choose which to use.

Actually simpler: have the FeedPage call both `familyFeed` and `familyEvents` in parallel, then merge client-side. No schema change needed for this.

**Rationale:** Schema unions are awkward in GraphQL. Two parallel queries is simpler and the FeedPage already has the merge logic for mock mode.

### 6. Lambda Handlers — Out of Scope (Document)

**Decision:** Update local server resolvers and schema, but NOT Lambda handlers. Production AppSync isn't being called by any client yet. When we do connect mobile/web to AppSync directly, we'll need a follow-up to add the same field resolvers there (likely via JS resolvers or by extending Lambda handlers to return enriched types).

Document this clearly so it doesn't get forgotten.

## Risks / Trade-offs

**[Cost of resolving counts on every post]** → For the feed, we resolve `reactionCount` and `commentCount` for every post. For 50 posts, that's 100 extra queries per feed render. Acceptable for local dev with 8 seed posts. For production, we'd want to denormalize counts onto the Post itself or batch via DataLoader. Document as future work.

**[Cache invalidation across requests]** → The per-request person cache means if a person is renamed mid-request, we serve stale name. Acceptable — within a single request the name shouldn't change.

**[Schema/handler drift]** → Local server now has different field resolvers than Lambda handlers. Document the gap and address when connecting clients to AppSync.
