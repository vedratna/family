## ADDED Requirements

### Requirement: Define bi-directional relationships

The system SHALL allow Owners and Admins to define relationships between two persons in a family. Each relationship SHALL have two labels: what person A is to person B, and what person B is to person A.

#### Scenario: Define parent-child relationship

- **WHEN** an Admin defines that Person A is "Mother" to Person B
- **THEN** the system SHALL store the relationship with A-to-B label "Mother" and B-to-A label "Daughter/Son" and type "parent-child"

#### Scenario: Define spouse relationship

- **WHEN** an Admin defines that Person A is "Husband" to Person B
- **THEN** the system SHALL store the relationship with A-to-B label "Husband" and B-to-A label "Wife" and type "spouse"

### Requirement: Relationship types

The system SHALL support the following relationship types: parent-child, spouse, sibling, in-law, grandparent-grandchild, uncle/aunt-nephew/niece, cousin, and custom. Custom relationships SHALL allow free-text labels.

#### Scenario: Custom relationship

- **WHEN** an Admin creates a relationship with type "custom" and labels "Godfather" / "Godchild"
- **THEN** the system SHALL store the relationship with those custom labels

### Requirement: Perspective-aware relationship viewing

The system SHALL display relationships from the perspective of the viewing member. Each member SHALL see relationship labels that describe what others are to them.

#### Scenario: View relationships from own perspective

- **WHEN** Person B views their relationships
- **THEN** Person A SHALL be displayed with the B-to-A label (e.g., "Mother") not the A-to-B label

### Requirement: Automatic relationship inference

The system SHALL infer potential relationships when new relationships are added. Inferred relationships SHALL be stored as "pending" suggestions requiring Admin confirmation.

Inference rules:

- Parent + Parent's Spouse → Step-parent or other parent
- Parent's Parent → Grandparent/Grandchild
- Parent's Sibling → Uncle or Aunt / Nephew or Niece
- Sibling's Spouse → Sibling-in-law
- Spouse's Parent → Parent-in-law / Child-in-law
- Parent's Sibling's Child → Cousin

#### Scenario: Infer grandparent relationship

- **WHEN** an Admin confirms that A is parent of B, and B is parent of C
- **THEN** the system SHALL suggest that A is grandparent of C as a pending relationship for Admin confirmation

#### Scenario: Infer in-law relationship

- **WHEN** an Admin confirms that A is parent of B, and B is spouse of C
- **THEN** the system SHALL suggest that A is parent-in-law of C as a pending relationship for Admin confirmation

#### Scenario: Admin rejects inferred relationship

- **WHEN** an Admin rejects a pending inferred relationship
- **THEN** the system SHALL discard the suggestion and not re-suggest the same relationship

### Requirement: Edit and delete relationships

The system SHALL allow Owners and Admins to edit relationship labels/types or delete relationships between persons.

#### Scenario: Edit relationship labels

- **WHEN** an Admin changes the labels of an existing relationship
- **THEN** the system SHALL update both directional labels and re-evaluate any inferences affected by the change
