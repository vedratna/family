## ADDED Requirements

### Requirement: Login page with signup, login, and demo options

The web app SHALL show a login page with three authentication paths: sign up a new user, log in with phone, or quick demo login with pre-seeded users.

#### Scenario: Sign up creates a new user

- **WHEN** user enters phone and display name on Sign Up tab
- **AND** submits the form
- **THEN** the app calls the register mutation with a generated cognitoSub
- **AND** sets the auth context and redirects to /feed

#### Scenario: Log in with phone

- **WHEN** user enters their phone on Log In tab
- **AND** submits the form
- **THEN** the app calls userByPhone query
- **AND** sets the auth context and redirects to /feed

#### Scenario: Quick demo login

- **WHEN** user clicks a demo user button (Mickey Mouse or Bart Simpson)
- **THEN** the auth context is set to that pre-seeded user
- **AND** the app redirects to /feed

#### Scenario: Protected routes redirect to login

- **WHEN** user navigates to /feed without being authenticated
- **THEN** the app redirects to /login

### Requirement: Auth context provides current user

All pages SHALL access the authenticated user via an auth context that provides userId, displayName, phone, and the x-user-id header for API requests.

#### Scenario: Auth header sent with requests

- **WHEN** an authenticated user's page makes a GraphQL request
- **THEN** the request includes `x-user-id: <userId>` header
- **AND** the local server uses this to resolve the caller's identity

#### Scenario: Auth persists across page refresh

- **WHEN** user refreshes the page while logged in
- **THEN** the auth context restores from localStorage
- **AND** the user remains on the current page

#### Scenario: Logout clears auth

- **WHEN** user logs out
- **THEN** auth context clears
- **AND** localStorage is cleared
- **AND** the app redirects to /login
