## ADDED Requirements

### Requirement: Create a family

The system SHALL allow any authenticated user to create a new family group. The creator SHALL automatically be assigned the Owner role for that family.

#### Scenario: Successful family creation

- **WHEN** an authenticated user provides a family name and requests creation
- **THEN** the system SHALL create the family and assign the user as Owner

### Requirement: Invite members to a family

The system SHALL allow users with Owner or Admin role to invite new members to the family by providing the invitee's phone number and their relationship to an existing member.

#### Scenario: Invite a new member by phone

- **WHEN** an Owner or Admin provides a phone number and relationship details for a new member
- **THEN** the system SHALL send an invitation to the phone number and create a pending membership

#### Scenario: Invitee accepts invitation

- **WHEN** an invited user accepts the family invitation
- **THEN** the system SHALL activate their membership with the assigned role and create the defined relationships

#### Scenario: Invite attempt by Editor or Viewer

- **WHEN** a user with Editor or Viewer role attempts to invite a member
- **THEN** the system SHALL reject the request with a permission error

### Requirement: Add non-app members to family

The system SHALL allow Owners and Admins to add person records to the family without requiring the person to have an app account. These records SHALL be usable in the family tree and relationships.

#### Scenario: Add deceased ancestor

- **WHEN** an Admin adds a person with name and relationship but no phone number
- **THEN** the system SHALL create a Person record without a linked user account, visible in the family tree

### Requirement: Role-based access control

The system SHALL enforce four roles: Owner, Admin, Editor, and Viewer. Each role SHALL have the following permissions:

- **Owner**: All permissions, can delete family, transfer ownership
- **Admin**: Manage members, assign roles (except Owner), manage calendar, moderate posts
- **Editor**: Create posts, events, comments, reactions
- **Viewer**: View all content, add reactions and comments

#### Scenario: Admin assigns Editor role

- **WHEN** an Admin assigns the Editor role to a member
- **THEN** the member SHALL have permission to create posts and events but not manage members

#### Scenario: Owner transfers ownership

- **WHEN** an Owner transfers ownership to another member
- **THEN** the target member SHALL become Owner and the original owner SHALL become Admin

#### Scenario: Viewer attempts to create a post

- **WHEN** a Viewer attempts to create a post
- **THEN** the system SHALL reject the request with a permission error

### Requirement: Multi-family membership

The system SHALL allow a single user account to be a member of multiple families. The system SHALL provide a family switcher interface.

#### Scenario: User switches between families

- **WHEN** a user who belongs to multiple families selects a different family
- **THEN** the system SHALL display the feed, calendar, tree, and members of the selected family with complete data isolation

### Requirement: Family theme color selection

The system SHALL allow Owners and Admins to select a theme accent color for the family from a predefined set of 8 options: Teal (default), Indigo, Coral, Sage, Amber, Ocean, Plum, and Slate. The theme color SHALL be applied to all UI accent elements (buttons, links, highlights, event cards, illustration tints) for all members viewing that family.

#### Scenario: Owner selects family theme during creation

- **WHEN** an Owner creates a family and selects Coral as the theme color
- **THEN** the family SHALL use Coral accent colors for all members

#### Scenario: Admin changes family theme

- **WHEN** an Admin changes the family theme from Teal to Indigo
- **THEN** all members SHALL see the updated Indigo accent color on their next app load

#### Scenario: Default theme applied

- **WHEN** an Owner creates a family without selecting a theme
- **THEN** the system SHALL apply the Teal theme as the default

### Requirement: Persistent invite prompt in header

The system SHALL display a persistent "Invite Family" button in the family header until at least 2 members (with app accounts) have joined the family. This applies to all members who can see the header.

#### Scenario: Single-member family shows invite prompt

- **WHEN** a family has only the Owner as an active member
- **THEN** the header SHALL display an "Invite Family" button prominently

#### Scenario: Two members joined — invite prompt removed

- **WHEN** a second member (not the Owner) joins the family
- **THEN** the "Invite Family" button SHALL be removed from the header

#### Scenario: Invite prompt visible to all members

- **WHEN** a family has fewer than 2 active members and a new member joins but the count is still below 2
- **THEN** the new member SHALL also see the "Invite Family" button in the header

### Requirement: Definer onboarding — setup checklist

The system SHALL display a dismissable setup checklist card on the feed for the family creator until all items are completed or the card is dismissed. Checklist items: Create family (auto-checked), Invite members, Add a family event, Share your first post, Complete your family tree.

#### Scenario: Checklist shows progress

- **WHEN** the Owner has created the family and invited 2 members but not yet posted or added events
- **THEN** the checklist SHALL show 2 of 5 items checked

#### Scenario: Owner dismisses checklist

- **WHEN** the Owner dismisses the setup checklist
- **THEN** the checklist SHALL not reappear

### Requirement: Invitee onboarding — mini-tour

The system SHALL display a 3-step mini-tour overlay for members who join via invitation on their first app session. The tour SHALL cover: (1) Family Feed — posts, photos, updates, (2) Calendar and Tree — events and family connections, (3) Notifications — how reminders work and where to configure preferences. The tour SHALL be skippable at any step.

#### Scenario: Invitee sees mini-tour on first login

- **WHEN** an invited member opens the app for the first time after joining a family
- **THEN** the system SHALL display a 3-step overlay tour highlighting the Feed, Calendar/Tree, and Notifications

#### Scenario: Invitee skips tour

- **WHEN** an invited member taps "Skip tour" during any step
- **THEN** the tour SHALL close and not reappear

#### Scenario: Tour does not repeat

- **WHEN** an invited member who has completed or skipped the tour opens the app again
- **THEN** the tour SHALL not be displayed

### Requirement: Remove a member

The system SHALL allow Owners and Admins to remove members from the family. Removal SHALL delete the membership and associated role but preserve Person records and relationships in the family tree.

#### Scenario: Admin removes a member

- **WHEN** an Admin removes a member from the family
- **THEN** the member SHALL lose access to the family, but their Person record and relationships SHALL remain in the tree
