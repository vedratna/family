## ADDED Requirements

### Requirement: Posts include resolved author name and aggregate counts

The `Post` GraphQL type SHALL include `authorName: String!`, `reactionCount: Int!`, and `commentCount: Int!` fields resolved from the post's family context.

#### Scenario: Feed shows author display names

- **WHEN** a client queries `familyFeed` selecting `authorName`
- **THEN** each post's `authorName` is the display name of the person identified by `authorPersonId` within the same family
- **AND** for system posts (`authorPersonId = "system"`), the resolved name is "System"

#### Scenario: Feed shows real reaction count

- **WHEN** a client queries `familyFeed` selecting `reactionCount`
- **THEN** each post's `reactionCount` equals the number of reactions on that post

#### Scenario: Feed shows real comment count

- **WHEN** a client queries `familyFeed` selecting `commentCount`
- **THEN** each post's `commentCount` equals the number of comments on that post

### Requirement: Comments include resolved author name

The `Comment` GraphQL type SHALL include `personName: String!` resolved from the comment's `personId` within the same family as the parent post.

#### Scenario: Post comments show commenter names

- **WHEN** a client queries `postComments` selecting `personName`
- **THEN** each comment's `personName` is the display name of the person who wrote the comment

### Requirement: Reactions include resolved person name

The `Reaction` GraphQL type SHALL include `personName: String!` resolved from `personId` within the same family as the parent post.

#### Scenario: Post reactions show person names

- **WHEN** a client queries `postReactions` selecting `personName`
- **THEN** each reaction's `personName` is the display name of the reacting person

### Requirement: Events include resolved creator name

The `Event` GraphQL type SHALL include `creatorName: String!` resolved from `creatorPersonId` within the event's family.

#### Scenario: Event detail shows creator name

- **WHEN** a client queries `eventDetail` selecting `creatorName`
- **THEN** the event's `creatorName` is the display name of the creating person

### Requirement: Event RSVPs include resolved person name

The `EventRSVP` GraphQL type SHALL include `personName: String!` resolved from `personId` within the event's family.

#### Scenario: Event RSVP list shows attendee names

- **WHEN** a client queries `eventRSVPs` selecting `personName`
- **THEN** each RSVP's `personName` is the display name of the attendee

### Requirement: Person resolution caches per request

The local server SHALL cache person lookups within a single GraphQL request to avoid repeated database queries for the same family.

#### Scenario: Multiple resolutions in one request hit DB once

- **WHEN** a single GraphQL request resolves `authorName` for 8 posts in the same family
- **THEN** the personRepo is queried at most once for that family's persons
- **AND** subsequent name lookups within the request use the cache

### Requirement: API-mode feed includes upcoming events

The web FeedPage in API mode SHALL display upcoming events mixed with posts in time order, matching mock-mode behavior.

#### Scenario: Feed shows posts and upcoming events

- **WHEN** the FeedPage renders in API mode for a family with posts and upcoming events
- **THEN** the feed shows both, sorted by date
- **AND** event cards link to the event detail page
- **AND** post cards link to the post detail page

### Requirement: Web pages display resolved names instead of IDs

All web pages displaying author/person names in API mode SHALL use the resolved name fields, never the raw ID.

#### Scenario: FeedPage shows author display names

- **WHEN** FeedPage renders in API mode
- **THEN** post cards show `authorName` (e.g., "Mickey Mouse"), not `authorPersonId` (e.g., "person-mickey")

#### Scenario: PostDetailPage shows comment author names

- **WHEN** PostDetailPage renders in API mode
- **THEN** comment author labels show `personName`, not `personId`

#### Scenario: EventDetailPage shows attendee names

- **WHEN** EventDetailPage renders in API mode
- **THEN** RSVP attendee names show `personName`, not `personId`
