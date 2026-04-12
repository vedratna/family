## ADDED Requirements

### Requirement: DynamoDB repository implementations match interfaces

Every repository interface in `repositories/interfaces/` SHALL have a corresponding DynamoDB implementation in `repositories/dynamodb/` that correctly persists and retrieves data using the single-table key schema.

#### Scenario: Family CRUD operations

- **WHEN** `DynamoFamilyRepository.create(family)` is called
- **THEN** the family is stored in DynamoDB with PK=`FAMILY#<id>`, SK=`METADATA`
- **AND** `getById(familyId)` returns the same family
- **AND** `updateTheme(familyId, newTheme)` changes only the theme
- **AND** `delete(familyId)` removes the item

#### Scenario: Person CRUD with family scoping

- **WHEN** `DynamoPersonRepository.create(person)` is called
- **THEN** the person is stored with PK=`FAMILY#<familyId>`, SK=`PERSON#<personId>`
- **AND** `getByFamilyId(familyId)` returns all persons in that family
- **AND** `getByUserId(familyId, userId)` queries GSI1 to find the person
- **AND** `update()` modifies only specified fields

#### Scenario: Membership with role management

- **WHEN** `DynamoMembershipRepository.create(membership)` is called
- **THEN** `getByFamilyId(familyId)` includes the new member
- **AND** `getByUserId(userId)` returns all families the user belongs to (via GSI1)
- **AND** `countActiveMembers(familyId)` returns the correct count
- **AND** `updateRole()` changes the member's role
- **AND** `delete()` removes the membership

#### Scenario: Invitation lifecycle

- **WHEN** `DynamoInvitationRepository.create(invitation)` is called
- **THEN** `getByFamilyAndPhone(familyId, phone)` returns the invitation
- **AND** `getByPhone(phone)` returns all invitations for that phone (via GSI1)
- **AND** `updateStatus()` changes the invitation status

#### Scenario: Relationship CRUD with bidirectional labels

- **WHEN** `DynamoRelationshipRepository.create(relationship)` is called
- **THEN** `getByFamily(familyId)` includes the relationship
- **AND** `getByPerson(familyId, personId)` returns relationships where the person is either personA or personB
- **AND** `getById(familyId, personAId, personBId)` returns the specific relationship
- **AND** `getPending(familyId)` returns only relationships with status "pending"

#### Scenario: Post feed with reverse chronological pagination

- **WHEN** posts are created via `DynamoPostRepository.create(post)`
- **THEN** `getFamilyFeed(familyId, limit)` returns posts in reverse chronological order
- **AND** pagination cursor allows fetching the next page
- **AND** `delete()` removes the post

#### Scenario: Comments and reactions on posts

- **WHEN** `DynamoCommentRepository.create(comment)` is called on a post
- **THEN** `getByPostId(postId, limit)` returns comments for that post with pagination
- **AND** `DynamoReactionRepository.add(reaction)` stores the reaction
- **AND** `getByPostId(postId)` returns all reactions
- **AND** `remove(postId, personId)` deletes the reaction

#### Scenario: Event CRUD with date range queries

- **WHEN** `DynamoEventRepository.create(event)` is called
- **THEN** `getByFamilyDateRange(familyId, start, end)` includes events within that range
- **AND** `getByFamilyAndType(familyId, type)` filters by event type
- **AND** `DynamoEventRSVPRepository.upsert(rsvp)` stores/updates RSVP
- **AND** `getByEvent(eventId)` returns all RSVPs for the event

#### Scenario: Chore CRUD with assignee queries

- **WHEN** `DynamoChoreRepository.create(chore)` is called
- **THEN** `getByFamily(familyId)` includes the chore
- **AND** `getByAssignee(familyId, personId)` returns only chores for that assignee
- **AND** `update()` modifies specified fields (status, assignee, etc.)
- **AND** `delete()` removes the chore

#### Scenario: Notification preferences with defaults

- **WHEN** `DynamoNotificationPrefRepository.setDefaults(userId, familyId)` is called
- **THEN** `getByUserAndFamily(userId, familyId)` returns default preferences for all categories
- **AND** `upsert()` updates a specific category preference
- **AND** `DynamoDeviceTokenRepository.register(token)` stores the token
- **AND** `getByUser(userId)` returns all registered device tokens

#### Scenario: Media metadata and S3 presigned URLs

- **WHEN** `DynamoMediaRepository.create(media)` is called
- **THEN** `getById(mediaId)` returns the media record
- **AND** `getByFamily(familyId)` returns all media for the family
- **AND** `S3StorageService.generateUploadUrl()` returns a valid presigned URL
- **AND** `S3StorageService.generateDownloadUrl()` returns a valid presigned URL

### Requirement: Integration tests cover all repository methods

Every public method on every DynamoDB repository SHALL have at least one integration test exercising real DynamoDB operations against DynamoDB Local.

#### Scenario: Full method coverage

- **WHEN** integration tests run against DynamoDB Local
- **THEN** every repository method is called with valid inputs and the result is verified
- **AND** edge cases are tested (not found returns undefined, empty lists, pagination boundaries)

#### Scenario: Test coverage meets threshold

- **WHEN** `vitest run --coverage` executes on repository implementation files
- **THEN** line coverage is at least 95%

### Requirement: Key builders follow single-table design

All DynamoDB key builders SHALL be defined in `keys.ts` following the established pattern and the key schema documented in the design.

#### Scenario: Key consistency

- **WHEN** a repository stores an entity
- **THEN** it uses key builders from `keys.ts` (not inline strings)
- **AND** the PK/SK/GSI1PK/GSI1SK match the documented key schema
