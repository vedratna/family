## Context

The web app renders 10 pages with static mock data. The backend has a local GraphQL server (`local-server/index.ts`) that currently returns stubs for most operations. The full use case layer (42 use cases), DynamoDB repos (11 implementations), and the extended GraphQL schema (11 queries, 22 mutations) all exist — they just aren't connected on the client side or in the local server.

## Goals / Non-Goals

**Goals:**

- `npm run dev` starts a fully functional local app (DynamoDB Local + API + web)
- Every GraphQL query and mutation works end-to-end locally
- Users can register, create families, post, comment, react, create events, RSVP, manage chores, define relationships, build trees
- Web pages use real data from API instead of static mocks
- Local auth bypass (pick a user, no Cognito)

**Non-Goals:**

- Cognito auth integration (follow-up — local auth bypass is sufficient for dev/testing)
- AppSync deployment changes (CDK already wired — deploying will work once Cognito is set up)
- Mobile app changes (mobile stays on mock mode for now)
- Real-time subscriptions
- File upload (S3 presigned URLs work but actual file picker is a follow-up)

## Decisions

### 1. Local GraphQL Server — Full Resolver Implementation

**Decision:** Rewrite `local-server/index.ts` to call real use cases with real DynamoDB repos, matching the Lambda handler logic exactly.

```
Current:                          After:
Apollo Standalone                 Apollo Standalone
  ├── health: "OK"                 ├── health: "OK"
  ├── register: stub               ├── register → RegisterWithPhone
  ├── createFamily: stub           ├── createFamily → CreateFamily
  └── ... (stubs)                  ├── familyFeed → GetFamilyFeed
                                   ├── createPost → CreatePost
                                   └── ... (all 33 operations)
```

**Rationale:** Keeps one source of truth for resolver logic. The local server mirrors what Lambda handlers do — instantiate repos, call use cases, return results. The only difference is auth: Lambda reads from `event.identity.sub`, local server reads from `x-user-id` header.

### 2. urql Client with Auth Exchange

**Decision:** Use urql with a custom auth exchange that:

- In mock mode: no network requests, use static data
- In API mode: sends GraphQL requests to the local server with `x-user-id` header

```typescript
const client = createClient({
  url: "http://localhost:4000/graphql",
  exchanges: [
    authExchange({
      addAuthToOperation: ({ authState, operation }) => {
        // Add x-user-id header for local auth
        return makeOperation(operation.kind, operation, {
          fetchOptions: {
            headers: { "x-user-id": authState.userId },
          },
        });
      },
    }),
    fetchExchange,
  ],
});
```

### 3. Typed GraphQL Operations — Colocated with Pages

**Decision:** Define GraphQL operations as typed constants colocated with the pages that use them, not in a centralized operations directory.

```
pages/
  FeedPage.tsx          ← imports useFeedQuery
  FeedPage.graphql.ts   ← defines FEED_QUERY, useFeedQuery hook
```

**Rationale:** Keeps operations close to their consumers. Easy to find what queries a page needs. Types generated from the schema ensure correctness.

### 4. Auth Context — Simple User Selector

**Decision:** Login page shows a list of seed users. Selecting one stores the userId in React state (no tokens, no persistence). Auth context provides `currentUser` to all pages. Protected routes redirect to `/login` when no user is selected.

**Rationale:** Minimal auth that unblocks all development. Real Cognito auth replaces this later without changing page components — only the auth provider changes.

### 5. Seed Script — Extended for All Entities

**Decision:** Extend the existing `seed.ts` to create a complete dataset:

- 2 users (matching the mock families — Sharma and Verma)
- 2 families with themes
- 6 persons across both families
- 4 memberships with roles
- 5 relationships
- 8 posts with comments and reactions
- 3 events with RSVPs
- 3 chores
- Notification preferences

**Rationale:** Matches the mock data exactly. Users see the same data whether in mock mode or API mode.

### 6. Mode Toggle — VITE_MOCK_MODE

**Decision:** `VITE_MOCK_MODE=true` (default) uses static mock data. `VITE_MOCK_MODE=false` uses urql client against the local GraphQL server.

Pages use a `useData` hook that returns the same shape regardless of mode:

```typescript
function useFeed(familyId: string) {
  const mockMode = import.meta.env.VITE_MOCK_MODE === "true";
  if (mockMode) return useMockFeed(familyId);
  return useApiFeed(familyId);
}
```

## Risks / Trade-offs

**[Local server divergence from Lambda handlers]** → The local server and Lambda handlers both call use cases, but routing logic is duplicated. Mitigate by keeping both as thin wrappers — the use case layer is the single source of truth.

**[Seed data maintenance]** → Seed data must match mock data shapes. Mitigate by deriving seed data from the same constants used by mobile mocks.

**[Auth bypass security]** → Local auth has no real security. Acceptable for local dev only. The `x-user-id` header pattern is already established in the local server.
