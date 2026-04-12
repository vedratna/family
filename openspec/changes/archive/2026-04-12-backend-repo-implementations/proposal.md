## Why

The backend has 11 repository interfaces and 42 use cases, all tested with mocked repositories (92 unit tests). But only 1 of 11 DynamoDB repository implementations exists (`DynamoUserRepository`). Without the remaining 10 implementations, no real data can be persisted or queried. This is the foundation — every Lambda handler and API endpoint depends on working repositories.

## What Changes

**Implement 10 DynamoDB repositories:**

- `DynamoFamilyRepository` — family CRUD, theme updates
- `DynamoMembershipRepository` — membership CRUD, role updates, member counting
- `DynamoPersonRepository` — person CRUD, lookup by user/family
- `DynamoInvitationRepository` — invitation CRUD, status updates, phone lookup
- `DynamoRelationshipRepository` — relationship CRUD, family/person queries, pending lookups
- `DynamoPostRepository` — post CRUD, paginated family feed
- `DynamoCommentRepository` — comment CRUD, paginated post comments
- `DynamoReactionRepository` — reaction add/remove, post reactions query
- `DynamoEventRepository` + `DynamoEventRSVPRepository` — event CRUD, date range queries, RSVP management
- `DynamoChoreRepository` — chore CRUD, family/assignee queries
- `DynamoNotificationPrefRepository` + `DynamoDeviceTokenRepository` — preferences upsert/defaults, device token management
- `DynamoMediaRepository` + `S3StorageService` — media metadata CRUD, presigned URL generation

**Integration tests against DynamoDB Local:**

- Every repository method tested with real DynamoDB operations
- Coverage target: 95% minimum on all repository files
- Create `vitest.integration.config.ts` for DynamoDB Local test setup

**Update seed script:**

- Extend `seed.ts` to populate all entity types (not just users)

## Capabilities

### New Capabilities

- `dynamo-repositories`: Complete DynamoDB single-table implementation of all 11 repository interfaces with integration tests

### Modified Capabilities

_(None — repository interfaces are unchanged. This implements existing contracts.)_

## Impact

- **New files**: 10+ repository implementation files in `repositories/dynamodb/`, integration test files, `vitest.integration.config.ts`
- **Modified files**: `repositories/dynamodb/keys.ts` (new key builders for all entities), `repositories/dynamodb/operations.ts` (if new query patterns needed), `repositories/dynamodb/seed.ts`
- **Dependencies**: None new — uses existing `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb`
- **Testing**: All integration tests require Docker (DynamoDB Local). CI already has a DynamoDB service container configured.
- **No changes to**: Use cases, interfaces, handlers, mobile, infra, shared types
