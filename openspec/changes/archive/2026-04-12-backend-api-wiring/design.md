## Context

The backend has 42 use cases across 9 domains, all with real DynamoDB repository implementations (114 integration tests). The AppSync GraphQL API is deployed but has no resolvers — the schema only covers auth + family (3 queries, 10 mutations). There is 1 Lambda handler (`handlers/auth/register.ts`) establishing the pattern.

## Goals / Non-Goals

**Goals:**

- Extend GraphQL schema to cover all 9 domains
- Create Lambda handlers for every GraphQL operation
- Wire AppSync resolvers to Lambda handlers via CDK
- Handler unit tests with 95% coverage
- CI integration tests for critical end-to-end paths

**Non-Goals:**

- Client-side changes (mobile or web) — that's separate
- Real Cognito auth flow testing — handlers use the caller identity from AppSync context
- Performance optimization — correct first
- Subscriptions or real-time features

## Decisions

### 1. One Lambda Per Domain (Not Per Operation)

**Decision:** Bundle handlers by domain into single Lambda functions (e.g., `family-handler` handles all family mutations/queries). AppSync resolves to the Lambda, passing the `fieldName` to route internally.

```
AppSync                    Lambda
───────                    ──────
createFamily  ──┐
inviteMember  ──┤──────▶  family-handler.ts
removeMember  ──┤          ├── switch(event.info.fieldName)
getMembers    ──┘          ├── case "createFamily": ...
                           └── case "inviteMember": ...
```

**Rationale:** 25+ individual Lambdas would be expensive (cold starts, deployment size). Domain-grouped Lambdas (9 functions) reduce cold starts via code reuse within a domain while keeping handlers focused. This is the standard AppSync pattern.

**Alternatives considered:**

- _One Lambda per operation_: Maximum isolation but 25+ functions. Rejected — deployment complexity, cold start multiplication.
- _Single monolith Lambda_: Simplest to wire but poor separation. Rejected — violates domain boundaries.

### 2. Handler Pattern — AppSync Lambda Resolver

**Decision:** Each handler follows the established pattern from `handlers/auth/register.ts`:

```typescript
import { AppSyncResolverEvent } from "aws-lambda";

// Repos + use cases instantiated at module scope (Lambda cold-start reuse)
const userRepo = new DynamoUserRepository();
const registerUseCase = new RegisterWithPhone(userRepo);

export async function handler(event: AppSyncResolverEvent<Args>): Promise<Result> {
  const field = event.info.fieldName;
  switch (field) {
    case "register":
      return handleRegister(event.arguments);
    // ...
  }
}
```

- `event.info.fieldName` routes to the correct operation
- `event.identity` provides the authenticated Cognito user
- Domain errors caught and re-thrown as `new Error(\`${code}: ${message}\`)`

### 3. GraphQL Schema Extension — Additive

**Decision:** Extend the existing schema with new types, queries, and mutations. Don't modify existing operations — they stay as-is.

New queries: `familyFeed`, `familyEvents`, `familyChores`, `familyRelationships`, `familyTree`, `postComments`, `eventDetail`, `notificationPreferences`

New mutations: `createPost`, `deletePost`, `addReaction`, `removeReaction`, `addComment`, `createEvent`, `editEvent`, `deleteEvent`, `rsvpEvent`, `createChore`, `completeChore`, `rotateChore`, `createRelationship`, `editRelationship`, `deleteRelationship`, `confirmInference`, `rejectInference`, `generateUploadUrl`, `confirmMediaUpload`, `registerDeviceToken`, `updateNotificationPreference`

### 4. CDK Wiring — Lambda Functions + JS Resolvers

**Decision:** Use `aws-cdk-lib/aws-lambda-nodejs` for TypeScript Lambda bundling and AppSync JS resolvers (not VTL) to map fields to Lambda data sources.

Each domain gets:

- One `NodejsFunction` construct
- One Lambda data source on the AppSync API
- Multiple resolver mappings (one per field)
- DynamoDB table read/write access
- S3 access (media handler only)
- Environment variables: TABLE_NAME, S3_BUCKET, STAGE

### 5. Auth Context — Cognito Identity from AppSync

**Decision:** Each handler extracts the authenticated user ID from `event.identity.sub` (Cognito user pool auth). For operations that need the caller's person/membership, the handler looks up the person by userId + familyId before calling the use case.

## Risks / Trade-offs

**[Cold start on domain Lambdas]** → Each domain Lambda bundles all use cases + repos for that domain. Tree-shaking via esbuild (NodejsFunction default) keeps bundle small. Accept ~500ms cold start for serverless.

**[Schema type explosion]** → Adding all domains adds ~20 new types. Acceptable — the schema should reflect the domain model fully.

**[Handler routing complexity]** → Switch statement per domain could grow. Mitigate by keeping each case to 3-5 lines (extract args, call use case, return result).
