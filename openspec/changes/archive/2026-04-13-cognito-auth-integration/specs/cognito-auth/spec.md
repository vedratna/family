## ADDED Requirements

### Requirement: Web supports phone signup with OTP

The web app SHALL allow users to sign up with their phone number and verify via OTP delivered by Cognito.

#### Scenario: Phone signup with OTP verification

- **WHEN** user enters phone and display name on the Sign Up tab
- **AND** submits the form
- **THEN** Cognito sends an SMS OTP to the phone
- **AND** an OTP entry step appears
- **AND** entering the correct OTP creates the user in Cognito
- **AND** the backend `register` mutation creates a User record linked to the Cognito sub
- **AND** the user is redirected to the welcome / feed page

#### Scenario: Wrong OTP shows error

- **WHEN** user enters an incorrect OTP
- **THEN** an error message is shown
- **AND** the form remains on the OTP entry step for retry

### Requirement: Web supports phone sign-in with Cognito

The web app SHALL allow returning users to sign in with phone via Cognito.

#### Scenario: Returning user signs in

- **WHEN** user enters their phone on Log In tab
- **THEN** Cognito returns tokens
- **AND** the user is signed in and redirected

#### Scenario: Unknown phone shows clear error

- **WHEN** user enters a phone that is not registered
- **THEN** the error "An account with this phone does not exist" is shown
- **AND** the form remains on the phone entry step

### Requirement: JWT injected into AppSync requests

The GraphQL client SHALL include `Authorization: Bearer <jwt>` on every AppSync request when in Cognito mode.

#### Scenario: GraphQL request includes Bearer token

- **WHEN** an authenticated page sends a GraphQL request
- **THEN** the Authorization header contains `Bearer <id-token>`

#### Scenario: Expired token triggers refresh

- **WHEN** the access token is within 5 minutes of expiry
- **THEN** the auth exchange refreshes the token before sending the request

#### Scenario: Failed refresh logs out the user

- **WHEN** refresh fails (revoked or invalid)
- **THEN** auth state is cleared
- **AND** the user is redirected to /login

### Requirement: Auth mode toggle

The web app SHALL select between local (x-user-id bypass) and Cognito modes via the `VITE_AUTH_MODE` env var.

#### Scenario: Local mode uses seed users

- **WHEN** `VITE_AUTH_MODE=local` (default for dev)
- **THEN** LoginPage shows demo user buttons + simple phone login
- **AND** GraphQL requests use x-user-id header

#### Scenario: Cognito mode uses real auth

- **WHEN** `VITE_AUTH_MODE=cognito`
- **THEN** LoginPage shows real signup + sign-in flows with OTP
- **AND** GraphQL requests use Bearer JWT

### Requirement: Cognito identity links to backend User record

The backend `register` mutation SHALL create a User record where `cognitoSub` equals the Cognito user's sub claim, so subsequent requests can be resolved via `event.identity.sub`.

#### Scenario: User created with linked sub

- **WHEN** signup completes via Cognito
- **AND** the client calls `register` with cognitoSub from the idToken
- **THEN** the backend stores a User record with that cognitoSub
- **AND** future GraphQL requests resolve the user via getByCognitoSub
