## ADDED Requirements

### Requirement: Family tree shows parent-child connecting lines

The TreePage SHALL render visual connecting lines between parents and children, and between spouse pairs, to make the family structure visible at a glance.

#### Scenario: Parent-child lines visible

- **WHEN** the tree includes a parent (gen N) and child (gen N+1) with a parent-child relationship
- **THEN** a line is drawn from the parent's bottom to the child's top

#### Scenario: Spouse pairs connected

- **WHEN** two persons have a spouse relationship
- **THEN** a horizontal line connects their nodes
- **AND** they are visually grouped (rendered next to each other)

#### Scenario: Multiple children share a parent line

- **WHEN** a parent has multiple children
- **THEN** all children connect to the same parent (lines do not overlap visually)
