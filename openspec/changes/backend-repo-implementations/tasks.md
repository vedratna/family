## 1. Test Infrastructure

- [ ] 1.1 Create `vitest.integration.config.ts` with DynamoDB Local setup (create table before suite, delete after)
- [ ] 1.2 Create test helper: `createTestTable()` / `deleteTestTable()` with correct schema (PK, SK, GSI1PK, GSI1SK)
- [ ] 1.3 Add `test:integration` script to backend `package.json`
- [ ] 1.4 Verify integration test setup works with existing `DynamoUserRepository`

## 2. Key Builders

- [ ] 2.1 Add key builders for Family, Person, Membership entities to `keys.ts`
- [ ] 2.2 Add key builders for Invitation, Relationship entities to `keys.ts`
- [ ] 2.3 Add key builders for Post, Comment, Reaction entities to `keys.ts`
- [ ] 2.4 Add key builders for Event, EventRSVP entities to `keys.ts`
- [ ] 2.5 Add key builders for Chore, NotificationPref, DeviceToken, Media entities to `keys.ts`
- [ ] 2.6 Add unit tests for all new key builders

## 3. Core Repositories (Family, Person, Membership)

- [ ] 3.1 Implement `DynamoFamilyRepository` — create, getById, updateTheme, delete
- [ ] 3.2 Write integration tests for `DynamoFamilyRepository` (all methods + edge cases)
- [ ] 3.3 Implement `DynamoPersonRepository` — create, getById, getByFamilyId, getByUserId (GSI1), update, delete
- [ ] 3.4 Write integration tests for `DynamoPersonRepository`
- [ ] 3.5 Implement `DynamoMembershipRepository` — create, getByFamilyId, getByUserId (GSI1), getByFamilyAndPerson, updateRole, delete, countActiveMembers
- [ ] 3.6 Write integration tests for `DynamoMembershipRepository`

## 4. Invitation & Relationship Repositories

- [ ] 4.1 Implement `DynamoInvitationRepository` — create, getByFamilyAndPhone, getByPhone (GSI1), updateStatus
- [ ] 4.2 Write integration tests for `DynamoInvitationRepository`
- [ ] 4.3 Implement `DynamoRelationshipRepository` — create, getByFamily, getByPerson, getById, update, delete, getPending
- [ ] 4.4 Write integration tests for `DynamoRelationshipRepository`

## 5. Feed Repositories (Post, Comment, Reaction)

- [ ] 5.1 Implement `DynamoPostRepository` — create, getById, getFamilyFeed (paginated, reverse chronological), delete
- [ ] 5.2 Write integration tests for `DynamoPostRepository` (including pagination)
- [ ] 5.3 Implement `DynamoCommentRepository` — create, getByPostId (paginated), delete
- [ ] 5.4 Write integration tests for `DynamoCommentRepository`
- [ ] 5.5 Implement `DynamoReactionRepository` — add, remove, getByPostId
- [ ] 5.6 Write integration tests for `DynamoReactionRepository`

## 6. Calendar Repositories (Event, RSVP)

- [ ] 6.1 Implement `DynamoEventRepository` — create, getById, getByFamilyDateRange, getByFamilyAndType, update, delete
- [ ] 6.2 Write integration tests for `DynamoEventRepository` (including date range queries)
- [ ] 6.3 Implement `DynamoEventRSVPRepository` — upsert, getByEvent, getByEventAndPerson
- [ ] 6.4 Write integration tests for `DynamoEventRSVPRepository`

## 7. Chore Repository

- [ ] 7.1 Implement `DynamoChoreRepository` — create, getById, getByFamily, getByAssignee, update, delete
- [ ] 7.2 Write integration tests for `DynamoChoreRepository`

## 8. Notification Repositories

- [ ] 8.1 Implement `DynamoNotificationPrefRepository` — getByUser, getByUserAndFamily, upsert, setDefaults
- [ ] 8.2 Write integration tests for `DynamoNotificationPrefRepository`
- [ ] 8.3 Implement `DynamoDeviceTokenRepository` — register, getByUser, delete
- [ ] 8.4 Write integration tests for `DynamoDeviceTokenRepository`

## 9. Media Repository & Storage Service

- [ ] 9.1 Implement `DynamoMediaRepository` — create, getById, getByFamily
- [ ] 9.2 Write integration tests for `DynamoMediaRepository`
- [ ] 9.3 Implement `S3StorageService` — generateUploadUrl, generateDownloadUrl (using S3 presigned URLs)
- [ ] 9.4 Write unit tests for `S3StorageService` (mocked S3 client)

## 10. Seed Script & Verification

- [ ] 10.1 Extend `seed.ts` to populate all entity types with sample data
- [ ] 10.2 Run all integration tests — verify 95%+ coverage on repository files
- [ ] 10.3 Run full CI checks — lint, typecheck, unit tests, integration tests all pass
