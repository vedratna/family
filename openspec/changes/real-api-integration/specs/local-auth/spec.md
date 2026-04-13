## ADDED Requirements

### Requirement: Login page with user selector

The web app SHALL show a login page where users select from available seed users to authenticate locally.

#### Scenario: Login page shows seed users

- **WHEN** user opens the app without being logged in
- **THEN** the login page shows a list of seed users with names
- **AND** selecting a user sets the auth context and redirects to /feed

#### Scenario: Protected routes redirect to login

- **WHEN** user navigates to /feed without logging in
- **THEN** the app redirects to /login

### Requirement: Auth context provides current user

All pages SHALL access the authenticated user via an auth context that provides userId, displayName, and the x-user-id header for API requests.

#### Scenario: Auth header sent with requests

- **WHEN** an authenticated user's page makes a GraphQL request
- **THEN** the request includes `x-user-id: <userId>` header
- **AND** the local server uses this to resolve the caller's identity

#### Scenario: Logout clears auth

- **WHEN** user logs out
- **THEN** auth context clears
- **AND** the app redirects to /login
