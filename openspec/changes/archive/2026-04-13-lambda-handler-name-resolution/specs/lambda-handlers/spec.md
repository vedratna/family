## MODIFIED Requirements

### Requirement: One Lambda handler per domain

Each of the 9 domains SHALL have a single Lambda handler function that routes operations based on `event.info.fieldName`, **and SHALL return enriched payloads matching the GraphQL schema's resolved-name and aggregate-count fields**.

#### Scenario: Family handler routes all family operations

- **WHEN** AppSync invokes the family Lambda with fieldName "createFamily"
- **THEN** the handler calls CreateFamily use case with the event arguments
- **AND** returns the CreateFamilyResult

#### Scenario: Feed handler returns enriched posts

- **WHEN** AppSync invokes the feed Lambda for `familyFeed`
- **THEN** the response items each include `authorName` (resolved from authorPersonId), `reactionCount`, and `commentCount`

#### Scenario: Feed handler returns enriched comments and reactions

- **WHEN** AppSync invokes the feed Lambda for `postComments` or `postReactions`
- **THEN** each item includes `personName` resolved from personId in the same family as the parent post

#### Scenario: Calendar handler returns enriched events and RSVPs

- **WHEN** AppSync invokes the calendar Lambda for `familyEvents` or `eventDetail`
- **THEN** each event includes `creatorName` resolved from creatorPersonId
- **AND** when `eventRSVPs` is invoked, each RSVP includes `personName`

#### Scenario: Family handler returns FamilyWithRole with personId

- **WHEN** AppSync invokes the family Lambda for `myFamilies`
- **THEN** each entry includes `personId` (the user's person record in that family)

#### Scenario: Unknown fieldName throws error

- **WHEN** a handler receives an unrecognized fieldName
- **THEN** it throws an error with message indicating the unknown operation

## ADDED Requirements

### Requirement: Per-invocation person name cache

Lambda handlers SHALL cache person name lookups within a single invocation to avoid repeated database queries for the same family.

#### Scenario: Multiple resolutions in one invocation hit DB once

- **WHEN** a single Lambda invocation enriches 8 posts in the same family
- **THEN** the personRepo is queried at most once for that family's persons
- **AND** subsequent name lookups within the invocation use the cache

### Requirement: Handler unit tests assert enriched fields

Unit tests for handlers that produce enriched payloads SHALL assert that the resolved-name and aggregate-count fields are present and correct.

#### Scenario: Feed handler test asserts authorName

- **WHEN** unit tests run on the feed handler
- **THEN** at least one test asserts that `authorName` is the mocked person's display name (not the raw personId)
- **AND** at least one test asserts `reactionCount` matches the number of reactions for a post
