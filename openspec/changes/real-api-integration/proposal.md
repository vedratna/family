## Why

The web app shows mock data but can't create, update, or delete anything. The backend has 42 use cases, 11 DynamoDB repos, and 9 Lambda handlers wired to AppSync — but no client connects to it. This change replaces mock data with real GraphQL API calls so users can perform every operation: register, create families, post to feed, manage events, assign chores, build the family tree, and more. The local dev stack (DynamoDB Local + local GraphQL server) allows full testing without AWS.

## What Changes

**GraphQL client layer (web + mobile shared patterns):**

- urql client configured for AppSync (HTTP + auth headers)
- GraphQL operations (queries + mutations) matching the schema exactly
- Typed hooks for every operation (`useQuery`, `useMutation` wrappers)
- Optimistic updates for instant UI feedback
- Error handling mapping GraphQL errors to user-facing messages

**Authentication (local dev first):**

- Local auth bypass: `x-user-id` header (same as local GraphQL server)
- Login page with user selector (pick a mock user from seed data)
- Auth context providing current user to all pages
- Protected routes redirecting to login when not authenticated
- Cognito integration deferred to a follow-up (real AWS auth)

**Local development stack (fully functional):**

- `npm run dev` starts DynamoDB Local + local GraphQL server + web app
- Seed script populates DynamoDB Local with realistic sample data
- Full CRUD workflow testable locally without AWS
- Same web pages, but data comes from real API instead of static mocks

**Web app updates:**

- Replace MockDataProvider with GraphQL queries
- Add mutation forms: create post, create event, create chore, invite member, create relationship
- Add update forms: edit event, edit relationship, complete chore, RSVP event
- Add delete actions: delete post, remove member, delete event
- Loading states, error states, empty states for all pages
- Refetch/invalidate cache after mutations

**Mobile app updates (optional, same pattern):**

- Same GraphQL operations work for mobile when ready
- Mobile can switch from mock to API mode via MOCK_MODE env var

## Capabilities

### New Capabilities

- `graphql-client`: urql client setup, typed GraphQL operations, auth exchange, error mapping
- `local-auth`: Local authentication bypass with user selector, auth context, protected routes
- `crud-forms`: Create/update/delete forms for all entities — posts, events, chores, relationships, families, members

### Modified Capabilities

- `web-feature-screens`: Pages updated from read-only mock display to full CRUD with API calls, loading/error states, and mutation forms

## Impact

- **New files**: GraphQL operation definitions, urql client config, auth context, mutation forms/modals, typed hooks
- **Modified files**: All web pages (replace mock data with queries), App.tsx (auth provider), local server (extend resolvers to call all use cases)
- **Dependencies**: `urql`, `graphql`, `@urql/exchange-auth` for web package
- **Local dev**: `npm run dev` becomes a fully functional app with DynamoDB Local backend
- **No changes to**: Backend use cases, DynamoDB repos, Lambda handlers, CDK infra, shared types
