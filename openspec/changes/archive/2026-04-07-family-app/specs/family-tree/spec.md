## ADDED Requirements

### Requirement: Auto-generate family tree from relationships
The system SHALL automatically generate a family tree visualization from the relationships defined between persons in a family. No manual tree-building SHALL be required.

#### Scenario: Tree generated after relationships are added
- **WHEN** a family has persons with defined relationships
- **THEN** the system SHALL render a tree visualization showing all persons positioned according to their generational relationships

#### Scenario: Tree updates when relationship changes
- **WHEN** a new relationship is added, modified, or deleted
- **THEN** the family tree visualization SHALL update to reflect the change

### Requirement: Display persons without app accounts in tree
The system SHALL display all Person records in the family tree, including those without linked user accounts (e.g., deceased ancestors or members who haven't joined the app).

#### Scenario: Deceased ancestor in tree
- **WHEN** a Person record exists without a user account
- **THEN** the person SHALL appear in the tree with their name and relationships, visually distinguished from active app members

### Requirement: Interactive tree navigation
The system SHALL allow users to tap on any person in the tree to view their profile, relationships, and (if they are an active member) their recent posts.

#### Scenario: Tap on tree member
- **WHEN** a user taps on a person in the family tree
- **THEN** the system SHALL display that person's profile card showing name, relationship to viewer, profile photo, and links to their posts

### Requirement: Tree supports multiple root nodes
The system SHALL support family trees with multiple root nodes (e.g., both maternal and paternal grandparents at the top) rather than requiring a single root ancestor.

#### Scenario: Two lineages in one tree
- **WHEN** a family tree includes both paternal and maternal grandparents
- **THEN** the system SHALL render both lineages connected through the parent generation
