## ADDED Requirements

### Requirement: Settings page shows notification categories

The SettingsPage SHALL display all 4 notification categories as a section with toggle controls.

#### Scenario: Categories rendered with friendly labels

- **WHEN** SettingsPage renders for an authenticated user with an active family
- **THEN** a Notifications section is shown
- **AND** the four categories are listed: "Events & Reminders", "Social Feed", "Comments on My Posts", "Family Updates"
- **AND** each row has the category description below the label

#### Scenario: Toggle reflects current preference state

- **WHEN** the notificationPreferences query returns enabled=true for "events-reminders"
- **THEN** the Events & Reminders toggle is shown in "on" state

#### Scenario: Toggle change triggers mutation

- **WHEN** user clicks the toggle for a category currently enabled
- **THEN** updateNotificationPreference is called with that category and enabled=false
- **AND** preferences refetch on success
- **AND** the toggle shows the new state

#### Scenario: Toggle disabled while saving

- **WHEN** an updateNotificationPreference mutation is in flight
- **THEN** the toggle for that category is disabled (cannot be re-clicked)

#### Scenario: Mutation error shown inline

- **WHEN** updateNotificationPreference fails
- **THEN** the friendly error message is shown near the toggles

### Requirement: Default preferences exist after joining a family

When a user creates or joins a family, default notification preferences SHALL be set automatically (all categories enabled) so the Settings page shows them immediately.

#### Scenario: New family creator gets defaults

- **WHEN** a user calls createFamily
- **THEN** all 4 default notification preferences for that user+family are created
- **AND** notificationPreferences query returns 4 records with enabled=true

#### Scenario: Invitee joining gets defaults

- **WHEN** a user calls acceptInvitation
- **THEN** all 4 default notification preferences for that user+family are created

#### Scenario: Missing preferences fall back to enabled

- **WHEN** notificationPreferences returns no record for a category
- **THEN** the UI shows that toggle as enabled (so the user sees a sensible default and can opt out)
