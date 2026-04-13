## ADDED Requirements

### Requirement: Feed page with posts and events

The FeedPage SHALL display a time-ordered list of posts and upcoming event cards with reactions and comment counts.

#### Scenario: Feed displays posts

- **WHEN** user navigates to /feed
- **THEN** posts render with author name, text content, time ago, reaction count, and comment count
- **AND** upcoming events render as cards mixed into the feed

#### Scenario: Post detail shows comments

- **WHEN** user clicks on a post
- **THEN** the app navigates to /feed/:postId showing the post and its comments

### Requirement: Calendar page with agenda and month views

The CalendarPage SHALL display events in both agenda (list) and month (grid) views.

#### Scenario: Agenda view lists events by date

- **WHEN** user navigates to /calendar
- **THEN** events display grouped by date with event details

#### Scenario: Month view shows event markers

- **WHEN** user switches to month view
- **THEN** a calendar grid renders with dots on days that have events

#### Scenario: Event detail shows full information

- **WHEN** user clicks an event
- **THEN** the app navigates to /calendar/:eventId showing title, type, date, location, description, and RSVP status

### Requirement: Family tree visualization

The FamilyTreePage SHALL render the family tree with nodes organized by generation.

#### Scenario: Tree renders with nodes

- **WHEN** user navigates to /tree
- **THEN** tree nodes render organized by generation with spouse connections
- **AND** clicking a node navigates to /tree/:personId showing that person's relationships

### Requirement: Chores page

The ChoresPage SHALL display family chores with status, assignee, and due date.

#### Scenario: Chore list renders

- **WHEN** user navigates to /chores
- **THEN** chores display with title, assignee name, due date, and status (pending/completed/overdue)

### Requirement: Settings page with members, theme, and notifications

The SettingsPage SHALL provide access to family members list, theme picker, notification preferences, and family switcher.

#### Scenario: Members list renders

- **WHEN** user navigates to /settings/members
- **THEN** family members display with name, role, and app account status

#### Scenario: Theme picker works

- **WHEN** user selects a new theme on the settings page
- **THEN** the accent color updates across the entire app

#### Scenario: Family switcher changes active family

- **WHEN** user selects a different family from the switcher
- **THEN** all pages update to show data for the new family
- **AND** the theme changes to the new family's theme
