## ADDED Requirements

### Requirement: Create forms for all entities

The web app SHALL provide create forms for posts, events, chores, relationships, families, and member invitations.

#### Scenario: Create post form

- **WHEN** user clicks "New Post" on the feed page
- **THEN** a form appears with text input
- **AND** submitting calls createPost mutation
- **AND** the new post appears in the feed

#### Scenario: Create event form

- **WHEN** user clicks "New Event" on the calendar page
- **THEN** a form appears with title, type, date, time, location fields
- **AND** submitting calls createEvent mutation
- **AND** the event appears in the calendar

#### Scenario: Create chore form

- **WHEN** user clicks "New Chore" on the chores page
- **THEN** a form appears with title, assignee, due date fields
- **AND** submitting calls createChore mutation

#### Scenario: Invite member form

- **WHEN** user clicks "Invite" on the members page
- **THEN** a form appears with phone, name, relationship, role fields
- **AND** submitting calls inviteMember mutation

### Requirement: Update and action forms

The web app SHALL support updating events, completing chores, RSVPing to events, and editing relationships.

#### Scenario: RSVP to event

- **WHEN** user clicks Going/Maybe/Can't on event detail
- **THEN** rsvpEvent mutation is called
- **AND** the RSVP list updates

#### Scenario: Complete chore

- **WHEN** user clicks "Complete" on a chore
- **THEN** completeChore mutation is called
- **AND** the chore status updates to completed

### Requirement: Delete actions

The web app SHALL support deleting posts, removing members, and deleting events with confirmation.

#### Scenario: Delete post

- **WHEN** user clicks delete on their own post
- **THEN** a confirmation dialog appears
- **AND** confirming calls deletePost mutation
- **AND** the post disappears from the feed

### Requirement: Loading and error states

All pages SHALL show loading indicators while queries are in flight and error messages when operations fail.

#### Scenario: Loading state shown

- **WHEN** a page query is in flight
- **THEN** a loading spinner or skeleton is shown

#### Scenario: Error state shown

- **WHEN** a mutation fails
- **THEN** an error message is shown to the user with the domain error reason
