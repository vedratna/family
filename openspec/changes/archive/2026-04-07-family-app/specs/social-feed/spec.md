## ADDED Requirements

### Requirement: Create posts with text and media
The system SHALL allow Editors, Admins, and Owners to create posts containing text, photos, videos, or a combination. Posts SHALL be associated with a single family.

#### Scenario: Create text-only post
- **WHEN** an Editor creates a post with text content
- **THEN** the system SHALL publish the post to the family feed with the author's name and timestamp

#### Scenario: Create post with photos
- **WHEN** an Editor creates a post with one or more photos
- **THEN** the system SHALL upload the photos to S3 and display them in the post on the family feed

#### Scenario: Create post with video
- **WHEN** an Editor creates a post with a video
- **THEN** the system SHALL upload the video to S3 and display it as a playable video in the post

#### Scenario: Viewer attempts to create post
- **WHEN** a Viewer attempts to create a post
- **THEN** the system SHALL reject the request with a permission error

### Requirement: Time-ordered feed as home page
The system SHALL display the family feed as the home page, with posts ordered by creation time (newest first).

#### Scenario: View family feed
- **WHEN** a member opens the app and views the home page
- **THEN** the system SHALL display posts in reverse chronological order with infinite scroll pagination

### Requirement: Reactions on posts
The system SHALL allow all family members (including Viewers) to add emoji reactions to posts.

#### Scenario: Add reaction
- **WHEN** a member adds a reaction to a post
- **THEN** the reaction SHALL be visible on the post with a count of how many members used that reaction

#### Scenario: Remove reaction
- **WHEN** a member removes their reaction from a post
- **THEN** the reaction count SHALL decrease and the member's reaction SHALL be removed

### Requirement: Comments on posts
The system SHALL allow all family members (including Viewers) to add text comments on posts.

#### Scenario: Add comment
- **WHEN** a member writes a comment on a post
- **THEN** the comment SHALL appear under the post with the commenter's name and timestamp

### Requirement: Upcoming event cards in feed
The system SHALL insert upcoming event reminder cards into the feed. Events within the next 7 days SHALL appear as cards between posts.

#### Scenario: Birthday in 3 days
- **WHEN** a family member's birthday is 3 days away
- **THEN** an event card SHALL appear in the feed showing the birthday details and days remaining

### Requirement: Share posts externally via share sheet
The system SHALL allow post authors to share their posts to external platforms (WhatsApp, Instagram, etc.) using the device's native OS share sheet.

#### Scenario: Share post to WhatsApp
- **WHEN** an author taps share on their post and selects WhatsApp
- **THEN** the system SHALL open the native share sheet with the post text and media pre-filled for sharing

### Requirement: Activation gate — posting blocked until family has 2+ members
The system SHALL prevent all content creation (posts, comments) in a family until at least one member other than the family creator has joined (i.e., minimum 2 active members with app accounts). This applies to all roles including Owner. Calendar events, non-app person records, and relationship definitions SHALL remain allowed during the locked state.

#### Scenario: Owner attempts to post in single-member family
- **WHEN** the family Owner attempts to create a post and no other member has joined the family
- **THEN** the system SHALL reject the post creation and display a message guiding the Owner to invite family members

#### Scenario: Owner attempts to comment in single-member family
- **WHEN** the family Owner attempts to comment on the system welcome post and no other member has joined
- **THEN** the system SHALL reject the comment and display a message guiding the Owner to invite family members

#### Scenario: First member joins — posting unlocked
- **WHEN** the first invited member accepts the invitation and joins the family
- **THEN** the system SHALL unlock content creation for all members and the feed SHALL display a prompt to create the first post

#### Scenario: Owner creates calendar event during locked state
- **WHEN** the family Owner creates a calendar event while no other member has joined
- **THEN** the system SHALL allow the event creation (calendar is not gated)

### Requirement: System-generated welcome post
The system SHALL automatically create a welcome post when a new family is created. The welcome post SHALL display the family name, creator name, and names of any invited members. The welcome post SHALL not be deletable.

#### Scenario: Family created with invites
- **WHEN** an Owner creates a family and sends invites to 2 members
- **THEN** the system SHALL create a welcome post: "Welcome to [Family Name]! [Owner] created this family space. Invites sent to [Member1] and [Member2]."

#### Scenario: Family created without invites
- **WHEN** an Owner creates a family and skips invitations
- **THEN** the system SHALL create a welcome post: "Welcome to [Family Name]! [Owner] created this family space. Invite your family to get started!"

### Requirement: Delete own posts
The system SHALL allow post authors to delete their own posts. Admins and Owners SHALL be able to delete any post in the family.

#### Scenario: Author deletes own post
- **WHEN** a post author deletes their post
- **THEN** the post and all associated comments and reactions SHALL be removed from the feed

#### Scenario: Admin deletes another member's post
- **WHEN** an Admin deletes a post authored by another member
- **THEN** the post SHALL be removed from the feed
