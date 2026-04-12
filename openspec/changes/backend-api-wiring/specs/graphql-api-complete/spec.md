## ADDED Requirements

### Requirement: GraphQL schema covers all domains

The GraphQL schema SHALL define queries and mutations for all 9 domains: auth, family, feed, calendar, chores, relationships, tree, media, and notifications.

#### Scenario: Feed operations available

- **WHEN** a client sends a `familyFeed` query with familyId, limit, and optional cursor
- **THEN** the API returns a paginated list of posts with cursor for next page

#### Scenario: Calendar operations available

- **WHEN** a client sends a `familyEvents` query with familyId, startDate, and endDate
- **THEN** the API returns events within the date range

#### Scenario: Chore operations available

- **WHEN** a client sends a `familyChores` query with familyId
- **THEN** the API returns all chores for the family

#### Scenario: Relationship and tree operations available

- **WHEN** a client sends a `familyRelationships` query with familyId
- **THEN** the API returns all relationships in the family
- **AND** a `familyTree` query returns the serialized tree structure

#### Scenario: Notification operations available

- **WHEN** a client sends a `notificationPreferences` query with familyId
- **THEN** the API returns the caller's notification preferences for that family

### Requirement: All mutations enforce authentication

Every mutation SHALL require a valid Cognito user token. Unauthenticated requests SHALL be rejected by AppSync before reaching the Lambda handler.

#### Scenario: Unauthenticated request rejected

- **WHEN** a request is sent without a valid Authorization header
- **THEN** AppSync returns a 401 UnauthorizedException

### Requirement: Domain errors map to GraphQL errors

Lambda handlers SHALL catch domain errors and re-throw them with the error code prefix so clients can parse error types.

#### Scenario: NotFoundError maps to GraphQL error

- **WHEN** a use case throws a NotFoundError
- **THEN** the handler re-throws with message `NOT_FOUND: <original message>`
- **AND** the GraphQL response includes the error in the errors array

#### Scenario: PermissionDeniedError maps to GraphQL error

- **WHEN** a use case throws a PermissionDeniedError
- **THEN** the handler re-throws with message `PERMISSION_DENIED: <original message>`
