## ADDED Requirements

### Requirement: Reusable accessible Toggle component

The web app SHALL provide a `Toggle` component implementing an accessible switch (button with `role="switch"` and `aria-checked`).

#### Scenario: Toggle reflects checked state

- **WHEN** Toggle is rendered with `checked=true`
- **THEN** the visual state shows "on" (filled track, circle on the right)
- **AND** `aria-checked="true"` is set

#### Scenario: Toggle reflects unchecked state

- **WHEN** Toggle is rendered with `checked=false`
- **THEN** the visual state shows "off" (neutral track, circle on the left)
- **AND** `aria-checked="false"` is set

#### Scenario: Click invokes onChange with negated value

- **WHEN** user clicks a Toggle with `checked=false`
- **THEN** `onChange(true)` is called

#### Scenario: Disabled blocks interaction

- **WHEN** Toggle has `disabled=true`
- **THEN** clicking does not call onChange
- **AND** the visual state appears muted

#### Scenario: Label is announced to screen readers

- **WHEN** Toggle is rendered with `label="Events & Reminders"`
- **THEN** the button has an accessible name matching the label
