## ADDED Requirements

### Requirement: deleteChore mutation exists

The GraphQL schema SHALL include a `deleteChore(familyId: ID!, choreId: ID!): Boolean!` mutation, with a corresponding `DeleteChore` use case and local server resolver.

#### Scenario: Delete chore removes it from family chores

- **WHEN** a user calls `deleteChore` with a valid familyId and choreId
- **THEN** the chore is removed from DynamoDB
- **AND** `familyChores` no longer returns it

### Requirement: Posts have delete UI

The web FeedPage and PostDetailPage SHALL show a Delete button on posts with a confirmation modal.

#### Scenario: Confirm delete on post detail

- **WHEN** user clicks Delete on a post they authored
- **THEN** ConfirmModal appears asking to confirm
- **AND** clicking Confirm calls `deletePost` mutation
- **AND** the page navigates back to the feed and the post no longer appears

### Requirement: Posts have reaction toggle UI

The PostDetailPage SHALL show a heart button that toggles a reaction for the current user.

#### Scenario: Reacting adds a reaction

- **WHEN** user has not reacted to the post and clicks the heart
- **THEN** `addReaction` mutation is called with emoji "❤️"
- **AND** the heart icon becomes filled
- **AND** reactionCount increments

#### Scenario: Un-reacting removes the reaction

- **WHEN** user has already reacted and clicks the heart
- **THEN** `removeReaction` mutation is called
- **AND** the heart icon becomes unfilled

### Requirement: Events have edit/delete UI

The EventDetailPage SHALL allow inline editing of title, description, and location, plus a Delete button with confirmation.

#### Scenario: Inline edit event title

- **WHEN** user clicks the event title
- **THEN** an input replaces the title with the current value
- **AND** Enter saves via `editEvent` mutation
- **AND** the new title is displayed

#### Scenario: Confirm delete event

- **WHEN** user clicks Delete on EventDetailPage
- **THEN** ConfirmModal appears
- **AND** Confirm calls `deleteEvent` mutation
- **AND** navigates back to the calendar

#### Scenario: RSVP highlights current selection

- **WHEN** EventDetailPage renders and current user has RSVP "going"
- **THEN** the "Going" button is visually selected (active style)

### Requirement: Chores have edit/delete UI and filter tabs

The ChoresPage SHALL allow inline editing of chore title, plus a Delete button with confirmation, plus filter tabs.

#### Scenario: Filter tabs filter the chore list

- **WHEN** user selects "Pending" tab
- **THEN** only chores with status "pending" are shown
- **AND** "All" shows everything regardless of status

#### Scenario: Inline edit chore title

- **WHEN** user clicks a chore title
- **THEN** input replaces it with the current value
- **AND** Enter saves (uses an `editChore` flow — actually no edit mutation exists yet, so this is a stretch goal; if not added, defer)

(Editing chore via existing operations: `chore-repo.update` exists but no GraphQL mutation. Defer chore inline edit unless a mutation is added.)

### Requirement: Relationships have edit/delete UI

The PersonPage SHALL allow editing relationship labels inline and deleting relationships with confirmation.

#### Scenario: Confirm delete relationship

- **WHEN** user clicks Delete on a relationship
- **THEN** ConfirmModal appears
- **AND** Confirm calls `deleteRelationship` mutation

### Requirement: Members have remove and role-change UI

The MembersPage SHALL allow removing members with confirmation and changing their role via a dropdown.

#### Scenario: Confirm remove member

- **WHEN** user clicks Remove on a member
- **THEN** ConfirmModal appears
- **AND** Confirm calls `removeMember` mutation
- **AND** the member disappears from the list

#### Scenario: Change member role

- **WHEN** user selects a different role from the dropdown
- **THEN** `updateMemberRole` mutation is called
- **AND** the member's displayed role updates
