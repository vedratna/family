## ADDED Requirements

### Requirement: Create and assign chores
The system SHALL allow Editors, Admins, and Owners to create chores and assign them to family members. Chores SHALL include: title, description, assignee, optional due date, and optional recurrence.

#### Scenario: Create a one-time chore
- **WHEN** an Editor creates a chore "Clean garage" assigned to a member with a due date
- **THEN** the chore SHALL appear in the family chore list and the assignee's personal chore view

#### Scenario: Create a recurring chore
- **WHEN** an Editor creates a chore "Take out trash" with weekly recurrence
- **THEN** the system SHALL automatically create new instances of the chore each week

### Requirement: Chore rotation
The system SHALL support rotating chore assignments among a defined set of family members on a configurable schedule.

#### Scenario: Weekly chore rotation
- **WHEN** a chore is set to rotate weekly among 3 members
- **THEN** the system SHALL automatically reassign the chore to the next member in the rotation each week

### Requirement: Mark chores as complete
The system SHALL allow the assigned member to mark a chore as complete.

#### Scenario: Complete a chore
- **WHEN** an assigned member marks a chore as complete
- **THEN** the chore status SHALL change to "completed" with a completion timestamp

### Requirement: View chore list
The system SHALL provide a chore list view showing all chores for the family, filterable by assignee and status (pending, completed, overdue).

#### Scenario: View overdue chores
- **WHEN** a member filters chores by "overdue" status
- **THEN** only chores past their due date that are not completed SHALL be displayed
