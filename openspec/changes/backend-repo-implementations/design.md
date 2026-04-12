## Context

The backend uses a single-table DynamoDB design with composite keys (PK/SK) and GSI1 for secondary access patterns. The existing `DynamoUserRepository` establishes the pattern: key builders in `keys.ts`, generic operations in `operations.ts` (`getItem`, `putItem`, `queryItems`, `updateItem`, `deleteItem`), and a repository class that implements the interface using these primitives.

All 11 repository interfaces are defined with exact method signatures. 42 use cases are tested against mocked repositories (92 tests). The DynamoDB access patterns are documented in `repositories/dynamodb/access-patterns.md`.

## Goals / Non-Goals

**Goals:**

- Implement all 11 repository interfaces against DynamoDB
- Follow the established pattern (key builders + generic operations + repository class)
- Integration tests against DynamoDB Local for every repository method
- 95% minimum test coverage on all repository files
- Create `vitest.integration.config.ts` with DynamoDB Local setup/teardown

**Non-Goals:**

- Changing any repository interface signatures
- Optimizing DynamoDB capacity or indexing (single-table design is already defined)
- Lambda handlers or API wiring (that's Change 2)
- Adding new use cases or business logic

## Decisions

### 1. Follow Existing DynamoUserRepository Pattern

**Decision:** Every repository follows the same structure as `DynamoUserRepository`:

- Key builders in `keys.ts` (extend the existing file)
- Repository class in its own file
- Private `toEntity()` mapper converting DynamoDB items to domain types
- Uses generic operations from `operations.ts`
- Handles `undefined` returns from `getItem` (returns `undefined`, not throwing)

**Rationale:** Consistency. The pattern is already established and working. One pattern across 11 implementations makes the codebase predictable.

### 2. Key Schema — Extend Existing keys.ts

**Decision:** Add key builder functions for all entities to the existing `keys.ts`:

```
Entity          PK                    SK                      GSI1PK              GSI1SK
─────────       ──────────            ──────────              ──────────          ──────────
User            USER#<userId>         PROFILE                 PHONE#<phone>       USER#<userId>
Family          FAMILY#<familyId>     METADATA                —                   —
Person          FAMILY#<familyId>     PERSON#<personId>       USER#<userId>       FAMILY#<familyId>
Membership      FAMILY#<familyId>     MEMBER#<personId>       USER#<userId>       MEMBER#<familyId>
Invitation      FAMILY#<familyId>     INVITE#<phone>          PHONE#<phone>       INVITE#<familyId>
Relationship    FAMILY#<familyId>     REL#<personAId>#<pBId>  —                   —
Post            FAMILY#<familyId>     POST#<timestamp>#<id>   —                   —
Comment         POST#<postId>         COMMENT#<ts>#<id>       —                   —
Reaction        POST#<postId>         REACT#<personId>        —                   —
Event           FAMILY#<familyId>     EVENT#<date>#<id>       —                   —
EventRSVP       EVENT#<eventId>       RSVP#<personId>         —                   —
Chore           FAMILY#<familyId>     CHORE#<choreId>         —                   —
NotifPref       USER#<userId>         NOTIFPREF#<fam>#<cat>   —                   —
DeviceToken     USER#<userId>         DEVICE#<token>          —                   —
Media           FAMILY#<familyId>     MEDIA#<mediaId>         —                   —
```

**Rationale:** Follows the single-table design documented in `access-patterns.md`. GSI1 used only where cross-partition queries are needed (user lookups, phone lookups).

### 3. Integration Test Setup — vitest.integration.config.ts

**Decision:** Create a separate vitest config for integration tests that:

- Starts DynamoDB Local (assumes Docker is running)
- Creates the table with the correct schema before each test suite
- Deletes the table after each test suite
- Uses a unique table name per test to allow parallel execution

**Rationale:** Integration tests need a real database. Separate config keeps unit tests fast (no Docker needed). CI already has DynamoDB Local as a service container.

### 4. Pagination — Cursor-Based with DynamoDB LastEvaluatedKey

**Decision:** Paginated queries (`getFamilyFeed`, `getByPostId`) encode `LastEvaluatedKey` as a base64 cursor string. The cursor is opaque to callers.

**Rationale:** Matches the `PaginatedResult<T>` interface already defined in `post-repo.ts`. DynamoDB's `LastEvaluatedKey` is the natural cursor.

## Risks / Trade-offs

**[GSI1 not sufficient for all access patterns]** → Some queries (e.g., `getByCognitoSub`) use scan+filter. Acceptable for low-frequency operations (login only). Document which operations are scan-based.

**[Test isolation with shared DynamoDB Local]** → Tests running in parallel could conflict. Mitigate with unique table names per test suite.

**[S3StorageService is not a DynamoDB repo]** → It implements `IStorageService` using S3 presigned URLs. Test with mocked S3 client, not integration test.
