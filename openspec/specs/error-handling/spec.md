## ADDED Requirements

### Requirement: Mutation errors are displayed to users

Every web page that triggers GraphQL mutations SHALL display the error to the user when the mutation fails, instead of silently closing the form.

#### Scenario: ActivationGateError shows friendly message

- **WHEN** a user creates a post in a single-member family
- **AND** the createPost mutation returns ActivationGateError
- **THEN** the form remains open with the user's input intact
- **AND** an error message is shown: "Invite at least one more member before posting or creating items."

#### Scenario: PermissionDeniedError shows friendly message

- **WHEN** a non-admin tries to invite a member
- **AND** the inviteMember mutation returns PermissionDeniedError
- **THEN** the error message "You don't have permission to do this." is shown

#### Scenario: NotFoundError shows friendly message

- **WHEN** a mutation references a deleted entity
- **THEN** the error message "Item not found. It may have been deleted." is shown

#### Scenario: Generic errors show the server message

- **WHEN** a mutation fails with an unrecognized error
- **THEN** the raw server message is shown (with the `[GraphQL]` prefix stripped)

### Requirement: Forms preserve user input on error

When a mutation fails, form inputs SHALL retain their values so the user can correct and retry.

#### Scenario: Failed createPost preserves text

- **WHEN** createPost fails
- **THEN** the textarea still contains the user's typed content

### Requirement: Query errors show retry option

Every page that fetches data via GraphQL SHALL show an error state with a Retry button when the query fails, instead of being stuck on "Loading...".

#### Scenario: Failed feed query shows retry

- **WHEN** the FAMILY_FEED_QUERY returns an error
- **THEN** the FeedPage shows an error message
- **AND** a Retry button is shown that re-executes the query with network-only policy

#### Scenario: Retry recovers from transient failure

- **WHEN** user clicks Retry after a transient error
- **AND** the retry succeeds
- **THEN** the page renders normally with the fetched data

### Requirement: Centralized error formatter

The web app SHALL provide a single `formatErrorMessage(error)` utility used by all mutations and query error states.

#### Scenario: Single source of truth

- **WHEN** any page handles a CombinedError
- **THEN** it imports `formatErrorMessage` from `lib/error-utils`
- **AND** the same error string is shown across pages for the same error code
