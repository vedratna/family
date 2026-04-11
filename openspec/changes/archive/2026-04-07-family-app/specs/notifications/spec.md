## ADDED Requirements

### Requirement: Push notification delivery

The system SHALL deliver push notifications to family members' devices via SNS. Notifications SHALL be delivered to all devices where the user is logged in.

#### Scenario: Notification delivered to multiple devices

- **WHEN** a notification is triggered for a user logged in on two devices
- **THEN** both devices SHALL receive the push notification

### Requirement: Per-member notification preferences

The system SHALL allow each member to configure notification preferences per family. Preferences SHALL be configurable per category.

Categories:

- Events & Reminders (default: ON) — birthday reminders, upcoming events, event changes
- Social Feed (default: OFF) — new posts, comments on own posts (default: ON), reactions
- Family Updates (default: OFF) — new member added, role changes

#### Scenario: Member disables social feed notifications

- **WHEN** a member turns off Social Feed notifications
- **THEN** the member SHALL not receive push notifications for new posts, but SHALL still receive notifications for comments on their own posts (unless explicitly disabled)

#### Scenario: Default notification state for new member

- **WHEN** a new member joins a family
- **THEN** Events & Reminders SHALL be ON, Social Feed SHALL be OFF, and Family Updates SHALL be OFF

### Requirement: Scheduled event reminders

The system SHALL schedule reminders for calendar events at configured intervals (default: 7 days, 1 day, and day-of). Reminders SHALL only be sent to members with Events & Reminders notifications enabled.

#### Scenario: Scheduled birthday reminder

- **WHEN** a birthday event is 7 days away
- **THEN** the system SHALL send a push notification to all members with Events & Reminders enabled

#### Scenario: Event deleted before reminder fires

- **WHEN** an event is deleted before a scheduled reminder time
- **THEN** the system SHALL cancel all pending reminders for that event

### Requirement: Re-engagement notifications for inactive families

The system SHALL send re-engagement push notifications to the family creator if no member (other than the creator) has joined the family. The cadence SHALL be: 24 hours after creation, 1 week after creation, and 1 month after creation. All re-engagement notifications SHALL stop immediately once the first member joins. No further re-engagement notifications SHALL be sent after the 1-month notification.

#### Scenario: 24-hour re-engagement notification

- **WHEN** 24 hours have passed since family creation and no member has joined
- **THEN** the system SHALL send a push notification to the creator: "Your [Family Name] is waiting! [Invitee names] haven't joined yet. Tap to resend invites."

#### Scenario: 1-week re-engagement notification

- **WHEN** 1 week has passed since family creation and no member has joined
- **THEN** the system SHALL send a push notification to the creator: "[Family Name] misses you! Your family space is ready — just needs your family! Invite them now."

#### Scenario: 1-month re-engagement notification

- **WHEN** 1 month has passed since family creation and no member has joined
- **THEN** the system SHALL send a push notification to the creator: "Still want to connect your family? [Family Name] is waiting for its first member. It takes just one invite."

#### Scenario: Member joins — re-engagement stops

- **WHEN** the first invited member joins the family before the next scheduled re-engagement notification
- **THEN** the system SHALL cancel all remaining re-engagement notifications for that family

#### Scenario: No notifications after 1 month

- **WHEN** 1 month has passed and all 3 re-engagement notifications have been sent
- **THEN** the system SHALL not send any further re-engagement notifications for that family

### Requirement: Reminder timing configuration

The system SHALL allow Admins and Owners to configure reminder timing per event (e.g., 1 week, 3 days, 1 day, 1 hour before).

#### Scenario: Custom reminder timing

- **WHEN** an Admin sets reminders for 3 days and 1 hour before an event
- **THEN** the system SHALL schedule notifications at those specific times instead of the defaults
