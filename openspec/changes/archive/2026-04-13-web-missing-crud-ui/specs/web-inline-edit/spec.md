## ADDED Requirements

### Requirement: Reusable inline edit component

The web app SHALL provide an `InlineEdit` component supporting click-to-edit text fields.

#### Scenario: Click switches to edit mode

- **WHEN** user clicks the displayed text
- **THEN** the text is replaced with an input field containing the same value
- **AND** the input is focused with the cursor at the end

#### Scenario: Enter saves value

- **WHEN** user presses Enter in the input
- **THEN** `onSave(newValue)` is called
- **AND** the component returns to display mode

#### Scenario: Escape cancels edit

- **WHEN** user presses Escape
- **THEN** the input value is discarded
- **AND** the component returns to display mode showing the original value
- **AND** `onSave` is not called

#### Scenario: Blur saves value

- **WHEN** user clicks outside the input
- **THEN** `onSave(newValue)` is called with the current input value
- **AND** the component returns to display mode

#### Scenario: Disabled prevents editing

- **WHEN** `disabled=true`
- **THEN** clicking the displayed text does not enter edit mode

#### Scenario: Empty save is rejected

- **WHEN** user clears the input and tries to save
- **THEN** the change is reverted (no `onSave` call with empty string)
