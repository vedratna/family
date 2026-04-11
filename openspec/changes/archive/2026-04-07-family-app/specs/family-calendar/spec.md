## ADDED Requirements

### Requirement: Create family events
The system SHALL allow Editors, Admins, and Owners to create events on the shared family calendar. Events SHALL include: title, date, optional time, optional location, optional description, and event type.

#### Scenario: Create a birthday event
- **WHEN** an Editor creates an event with type "birthday", title "Grandma's 75th Birthday", and date April 12
- **THEN** the event SHALL appear on the family calendar for that date

#### Scenario: Create a recurring event
- **WHEN** an Editor creates a birthday event and marks it as annually recurring
- **THEN** the system SHALL automatically create the event on the same date each subsequent year

### Requirement: Event types
The system SHALL support the following event types: birthday, marriage/anniversary, exam, social function, holiday, and custom.

#### Scenario: Filter calendar by event type
- **WHEN** a member filters the calendar by "birthday" type
- **THEN** only birthday events SHALL be displayed

### Requirement: View family calendar
The system SHALL display a shared calendar view showing all events for the selected family. The calendar SHALL support month, week, and agenda views.

#### Scenario: View monthly calendar
- **WHEN** a member opens the calendar in month view
- **THEN** the system SHALL display all events for that month with visual indicators on event dates

### Requirement: Edit and delete events
The system SHALL allow the event creator, Admins, and Owners to edit or delete calendar events.

#### Scenario: Edit event details
- **WHEN** an Admin changes the time of an existing event
- **THEN** the updated time SHALL be reflected on the calendar and trigger updated reminders

#### Scenario: Delete an event
- **WHEN** an event creator deletes an event
- **THEN** the event SHALL be removed from the calendar and all associated reminders SHALL be cancelled

### Requirement: Event reminders
The system SHALL generate reminders for upcoming events at configurable intervals. Default reminder times SHALL be: 7 days before, 1 day before, and day-of.

#### Scenario: Reminder 1 day before event
- **WHEN** an event is 1 day away
- **THEN** the system SHALL trigger a reminder notification to all members who have event notifications enabled

### Requirement: RSVP to events
The system SHALL allow family members to indicate their attendance status for events: Going, Maybe, Not Going.

#### Scenario: Member RSVPs as Going
- **WHEN** a member marks "Going" on an event
- **THEN** the event SHALL display the member in the "Going" list and the attendance count SHALL update
