## ADDED Requirements

### Requirement: Quick start guide (Level 1)
The user guide SHALL include a quick start file (`docs/user-guide/00-quick-start.md`) that walks a new user through: creating an account (phone or social login), setting up their profile, creating their first family (with theme selection), and inviting their first family member — all in under 2 minutes of reading. It SHALL include a visual flow diagram showing the complete onboarding path.

#### Scenario: First-time user reads quick start
- **WHEN** a user opens `docs/user-guide/00-quick-start.md`
- **THEN** they SHALL find a step-by-step guide with a flow diagram covering account creation through first invite, without needing to read any other file

### Requirement: Home feed feature guide (Level 2)
The user guide SHALL include a home feed file (`docs/user-guide/01-home-feed.md`) covering: what appears in the feed, creating posts (text, photos, videos), reacting to posts, commenting, sharing posts externally via share sheet, how upcoming event cards appear in the feed, and the activation gate (why posting is blocked until a family member joins).

#### Scenario: User wants to share a post to WhatsApp
- **WHEN** a user reads the home feed guide
- **THEN** they SHALL find instructions for sharing posts externally, including that it uses the device's native share sheet

### Requirement: Family calendar feature guide (Level 2)
The user guide SHALL include a calendar file (`docs/user-guide/02-family-calendar.md`) covering: creating events (with event type selection), month view vs agenda view, RSVP-ing to events, setting up recurring events (birthdays, anniversaries), and how automatic reminders work (7 days, 1 day, day-of).

#### Scenario: User wants to set up annual birthday reminders
- **WHEN** a user reads the calendar guide
- **THEN** they SHALL find a walkthrough for creating a birthday event with the "repeat annually" option and understand the automatic reminder cadence

### Requirement: Family tree feature guide (Level 2)
The user guide SHALL include a tree file (`docs/user-guide/03-family-tree.md`) covering: how the tree builds itself from relationships, adding relationships between members, understanding bi-directional labels (perspective-aware), confirming or dismissing suggested relationships from the inference engine, tapping tree nodes to view profiles, and adding non-app members to the tree.

#### Scenario: User sees a suggested relationship and wants to understand it
- **WHEN** a user reads the family tree guide
- **THEN** they SHALL find an explanation of how the system infers relationships (e.g., if A is parent of B and B is spouse of C, A may be parent-in-law of C) and how to confirm or dismiss suggestions

### Requirement: Chores feature guide (Level 2)
The user guide SHALL include a chores file (`docs/user-guide/04-chores.md`) covering: creating and assigning chores, marking chores complete, setting up chore rotation, and viewing filtered chore lists (by assignee, status).

#### Scenario: User wants to set up weekly rotating chores
- **WHEN** a user reads the chores guide
- **THEN** they SHALL find instructions for creating a chore with rotation members and understanding how the assignment cycles

### Requirement: Settings and customization guide (Level 2)
The user guide SHALL include a settings file (`docs/user-guide/05-settings.md`) covering: changing family theme color (8 options), toggling dark mode (light/dark/system), configuring notification preferences (events ON by default, social OFF by default, comments-on-own ON), managing family members (roles: owner/admin/editor/viewer), and transferring ownership.

#### Scenario: User wants to change notification preferences
- **WHEN** a user reads the settings guide
- **THEN** they SHALL find the default notification states and instructions for toggling each category

### Requirement: Multi-family guide (Level 2)
The user guide SHALL include a multi-family file (`docs/user-guide/06-multi-family.md`) covering: how one account can belong to multiple families, the family switcher, how each family has its own theme color/feed/calendar/tree, and that data is completely isolated between families.

#### Scenario: User belongs to two families
- **WHEN** a user reads the multi-family guide
- **THEN** they SHALL understand how to switch between families and that each has independent data

### Requirement: Detailed onboarding walkthrough (Level 3)
The user guide SHALL include a detailed walkthrough section showing the complete onboarding flow for both the family definer (5 screens: welcome → phone → profile → create family → invite) and the invitee (3 screens: invitation landing → profile → mini-tour). It SHALL include screen-by-screen descriptions with visual representations.

#### Scenario: User is confused during onboarding
- **WHEN** a user reads the detailed onboarding walkthrough
- **THEN** they SHALL find a screen-by-screen description of what they see and what to do at each step, for both the definer and invitee paths

### Requirement: Roles and permissions guide (Level 3)
The user guide SHALL include a roles and permissions section explaining what each role (owner, admin, editor, viewer) can and cannot do, presented as a permissions matrix table.

#### Scenario: Admin wonders if they can delete someone else's post
- **WHEN** a user reads the roles and permissions guide
- **THEN** they SHALL find a clear matrix showing that admins can moderate posts but cannot transfer ownership or delete the family
