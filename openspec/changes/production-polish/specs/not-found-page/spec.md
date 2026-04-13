## ADDED Requirements

### Requirement: 404 page for unknown routes

The web app SHALL render a "Page not found" page for any URL not matching a defined route.

#### Scenario: Unknown URL shows 404

- **WHEN** user navigates to a URL that has no matching route (e.g., /foo/bar)
- **THEN** the NotFoundPage renders with a friendly message
- **AND** a link back to /feed is shown
