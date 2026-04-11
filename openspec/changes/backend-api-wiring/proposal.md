## Why

The backend has 42 use cases with real DynamoDB repositories (after Change 1), 6 deployed CDK stacks including an AppSync API, and a GraphQL schema — but only 1 Lambda handler exists and AppSync has no resolver mappings. The API endpoint returns 401 because nothing is wired. This change connects use cases to the GraphQL API so clients (mobile + web) can call real endpoints.

## What Changes

**Extend GraphQL schema:**

- Add queries: `familyFeed`, `familyEvents`, `familyChores`, `familyRelationships`, `familyTree`, `notificationPreferences`, `eventDetail`, `postComments`
- Add mutations: `createPost`, `deletePost`, `addReaction`, `removeReaction`, `addComment`, `createEvent`, `editEvent`, `deleteEvent`, `rsvpEvent`, `createChore`, `completeChore`, `rotateChore`, `createRelationship`, `editRelationship`, `deleteRelationship`, `confirmInference`, `rejectInference`, `generateUploadUrl`, `confirmMediaUpload`, `registerDeviceToken`, `updateNotificationPreference`
- Add corresponding return types and input types

**Create Lambda handlers (one per GraphQL operation):**

- Follow existing pattern from `handlers/auth/register.ts`: instantiate repos + use case at module scope, extract args from `event.arguments`, call `useCase.execute()`, catch `DomainError` and re-throw
- Organize by domain: `handlers/auth/`, `handlers/family/`, `handlers/feed/`, `handlers/calendar/`, `handlers/chores/`, `handlers/relationships/`, `handlers/tree/`, `handlers/media/`, `handlers/notifications/`

**Wire AppSync resolvers in CDK:**

- Create Lambda functions for each handler in the API stack
- Add Lambda data sources to AppSync
- Map every Query/Mutation field to its Lambda resolver
- Grant DynamoDB table access and S3 access to Lambda functions
- Pass environment variables (TABLE_NAME, S3_BUCKET, etc.)

**Handler tests:**

- Unit tests for every handler (mocked use cases)
- Integration tests for critical paths (handler → use case → DynamoDB Local)
- Coverage target: 95% minimum

## Capabilities

### New Capabilities

- `graphql-api-complete`: Full GraphQL API surface covering all 9 domains with Lambda resolvers, AppSync wiring, and Cognito auth context
- `lambda-handlers`: Lambda handler layer translating GraphQL operations to use case calls with domain error mapping

### Modified Capabilities

_(None — no existing spec requirements change. This implements the API layer.)_

## Impact

- **New files**: ~25 Lambda handler files, extended GraphQL schema, handler test files
- **Modified files**: `infra/lib/api-stack.ts` (Lambda functions, data sources, resolvers), `infra/graphql/schema.graphql` (new queries/mutations/types)
- **Dependencies**: None new for backend. CDK may need `aws-cdk-lib/aws-lambda-nodejs` for bundling TypeScript handlers.
- **Infrastructure**: Deploying this will create ~25 Lambda functions + AppSync resolvers. Dev deploy will be larger.
- **Prerequisite**: Change `backend-repo-implementations` must be complete (handlers depend on real repository implementations)
