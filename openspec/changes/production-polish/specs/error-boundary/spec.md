## ADDED Requirements

### Requirement: Global error boundary catches render errors

The web app SHALL have a top-level React error boundary that catches uncaught errors during rendering and displays a friendly fallback UI.

#### Scenario: Component error shows fallback

- **WHEN** any component throws an error during render
- **THEN** the ErrorBoundary catches it
- **AND** a friendly fallback UI is shown with the message and a Reload button
- **AND** the error is logged to the console

#### Scenario: Reload button restores the app

- **WHEN** user clicks the Reload button on the fallback UI
- **THEN** the page reloads
