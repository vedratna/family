## ADDED Requirements

### Requirement: Tab navigation renders screen content

Each tab in the TabNavigator SHALL render its corresponding primary screen with mock data when selected.

#### Scenario: Feed tab shows feed screen

- **WHEN** user taps the Feed tab
- **THEN** FeedScreen renders with mock posts, event cards, reactions, and comment counts

#### Scenario: Calendar tab shows agenda screen

- **WHEN** user taps the Calendar tab
- **THEN** AgendaScreen renders with mock events grouped by date

#### Scenario: Tree tab shows family tree screen

- **WHEN** user taps the Tree tab
- **THEN** FamilyTreeScreen renders with mock tree nodes and generation layout

#### Scenario: Chores tab shows chore list screen

- **WHEN** user taps the Chores tab
- **THEN** ChoreListScreen renders with mock chores showing assignee, status, and due date

#### Scenario: More tab shows menu

- **WHEN** user taps the More tab
- **THEN** a menu screen renders with links to Members, Settings, Notifications, and Family Switcher

### Requirement: Intra-tab navigation to detail screens

Tapping items within a tab SHALL navigate to the appropriate detail screen within that tab.

#### Scenario: Feed post opens comments

- **WHEN** user taps a post's comment area in the Feed tab
- **THEN** CommentsScreen renders showing mock comments for that post
- **AND** a back button returns to the feed list

#### Scenario: Calendar event opens detail

- **WHEN** user taps an event in the Calendar tab
- **THEN** EventDetailScreen renders with mock event details
- **AND** a back button returns to the agenda

#### Scenario: Calendar switches between agenda and month views

- **WHEN** user taps the month/agenda toggle in the Calendar tab
- **THEN** the view switches between AgendaScreen and CalendarMonthScreen

#### Scenario: Tree person opens relationships

- **WHEN** user taps a person node in the Tree tab
- **THEN** PersonRelationshipsScreen renders showing that person's mock relationships
- **AND** a back button returns to the tree

#### Scenario: More menu opens sub-screens

- **WHEN** user taps "Members" in the More menu
- **THEN** MembersListScreen renders with mock family members
- **AND** a back button returns to the More menu

### Requirement: Mock data flows from provider to screens

All screen data SHALL come from MockDataProvider via the `useMockData()` hook, transformed by container components into screen-specific props.

#### Scenario: Feed container transforms mock data

- **WHEN** FeedContainer reads from useMockData()
- **THEN** it transforms posts, comments, reactions, and events into FeedItem[] props for FeedScreen

#### Scenario: Data reflects active family

- **WHEN** user switches family via the header
- **THEN** all tab screens update to show data for the newly active family

### Requirement: Family switcher changes theme

Tapping the family switcher in the AppHeader SHALL cycle through available families and apply their theme.

#### Scenario: Switch family updates header and theme

- **WHEN** user taps the family name in the header
- **THEN** the active family changes to the next family
- **AND** the app's color theme updates to match the new family's theme
