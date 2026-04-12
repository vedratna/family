## 1. Test Infrastructure

- [x] 1.1 Create `vitest.integration.config.ts` with DynamoDB Local setup (create table before suite, delete after)
- [x] 1.2 Create test helper: `createTestTable()` / `deleteTestTable()` with correct schema (PK, SK, GSI1PK, GSI1SK)
- [x] 1.3 Add `test:integration` script to backend `package.json`
- [x] 1.4 Verify integration test setup works with existing `DynamoUserRepository`

## 2. Key Builders

- [x] 2.1 Add key builders for Family, Person, Membership entities to `keys.ts`
- [x] 2.2 Add key builders for Invitation, Relationship entities to `keys.ts`
- [x] 2.3 Add key builders for Post, Comment, Reaction entities to `keys.ts`
- [x] 2.4 Add key builders for Event, EventRSVP entities to `keys.ts`
- [x] 2.5 Add key builders for Chore, NotificationPref, DeviceToken, Media entities to `keys.ts`
- [x] 2.6 Add unit tests for all new key builders

## 3. Core Repositories (Family, Person, Membership)

- [x] 3.1 Implement `DynamoFamilyRepository` — create, getById, updateTheme, delete
- [x] 3.2 Write integration tests for `DynamoFamilyRepository` (all methods + edge cases)
- [x] 3.3 Implement `DynamoPersonRepository` — create, getById, getByFamilyId, getByUserId (GSI1), update, delete
- [x] 3.4 Write integration tests for `DynamoPersonRepository`
- [x] 3.5 Implement `DynamoMembershipRepository` — create, getByFamilyId, getByUserId (GSI1), getByFamilyAndPerson, updateRole, delete, countActiveMembers
- [x] 3.6 Write integration tests for `DynamoMembershipRepository`

## 4. Invitation & Relationship Repositories

- [x] 4.1 Implement `DynamoInvitationRepository` — create, getByFamilyAndPhone, getByPhone (GSI1), updateStatus
- [x] 4.2 Write integration tests for `DynamoInvitationRepository`
- [x] 4.3 Implement `DynamoRelationshipRepository` — create, getByFamily, getByPerson, getById, update, delete, getPending
- [x] 4.4 Write integration tests for `DynamoRelationshipRepository`

## 5. Feed Repositories (Post, Comment, Reaction)

- [x] 5.1 Implement `DynamoPostRepository` — create, getById, getFamilyFeed (paginated, reverse chronological), delete
- [x] 5.2 Write integration tests for `DynamoPostRepository` (including pagination)
- [x] 5.3 Implement `DynamoCommentRepository` — create, getByPostId (paginated), delete
- [x] 5.4 Write integration tests for `DynamoCommentRepository`
- [x] 5.5 Implement `DynamoReactionRepository` — add, remove, getByPostId
- [x] 5.6 Write integration tests for `DynamoReactionRepository`

## 6. Calendar Repositories (Event, RSVP)

- [x] 6.1 Implement `DynamoEventRepository` — create, getById, getByFamilyDateRange, getByFamilyAndType, update, delete
- [x] 6.2 Write integration tests for `DynamoEventRepository` (including date range queries)
- [x] 6.3 Implement `DynamoEventRSVPRepository` — upsert, getByEvent, getByEventAndPerson
- [x] 6.4 Write integration tests for `DynamoEventRSVPRepository`

## 7. Chore Repository

- [x] 7.1 Implement `DynamoChoreRepository` — create, getById, getByFamily, getByAssignee, update, delete
- [x] 7.2 Write integration tests for `DynamoChoreRepository`

## 8. Notification Repositories

- [x] 8.1 Implement `DynamoNotificationPrefRepository` — getByUser, getByUserAndFamily, upsert, setDefaults
- [x] 8.2 Write integration tests for `DynamoNotificationPrefRepository`
- [x] 8.3 Implement `DynamoDeviceTokenRepository` — register, getByUser, delete
- [x] 8.4 Write integration tests for `DynamoDeviceTokenRepository`

## 9. Media Repository & Storage Service

- [x] 9.1 Implement `DynamoMediaRepository` — create, getById, getByFamily
- [x] 9.2 Write integration tests for `DynamoMediaRepository`
- [x] 9.3 Implement `S3StorageService` — generateUploadUrl, generateDownloadUrl (using S3 presigned URLs)
- [x] 9.4 Write unit tests for `S3StorageService` (mocked S3 client)

## 10. Seed Script & Verification

- [x] 10.1 Extend `seed.ts` to populate all entity types with sample data
- [x] 10.2 Run all integration tests — verify 95%+ coverage on repository files
- [x] 10.3 Run full CI checks — lint, typecheck, unit tests, integration tests all pass
