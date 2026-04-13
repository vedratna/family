## ADDED Requirements

### Requirement: Reusable confirmation modal

The web app SHALL provide a `ConfirmModal` component used by all destructive actions to confirm intent.

#### Scenario: Modal renders with title and message

- **WHEN** ConfirmModal is rendered with `open=true`, title "Delete Post?", message "This cannot be undone."
- **THEN** a backdrop overlays the page
- **AND** a card shows the title and message
- **AND** Cancel and Confirm buttons are shown

#### Scenario: Confirm button is destructive-styled

- **WHEN** ConfirmModal is rendered
- **THEN** the Confirm button uses a red/destructive style
- **AND** the Cancel button uses a neutral style

#### Scenario: Cancel closes without action

- **WHEN** user clicks Cancel
- **THEN** `onCancel` is called
- **AND** `onConfirm` is not called

#### Scenario: Confirm fires action and shows loading state

- **WHEN** user clicks Confirm with `loading=true`
- **THEN** the Confirm button shows a loading state and is disabled

#### Scenario: Closed modal renders nothing

- **WHEN** `open=false`
- **THEN** the modal renders nothing (no backdrop, no card)
