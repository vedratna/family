## ADDED Requirements

### Requirement: Mock data providers for all domain entities

The system SHALL include mock data providers that supply realistic sample data for: 2 families (with different themes), 6 persons, 4 memberships, 5 relationships, 8 posts (with media), 3 events, 3 chores, and notification preferences. Mock data SHALL use the same TypeScript types as real API responses.

#### Scenario: Developer starts app in mock mode

- **WHEN** a developer runs the mobile app with `MOCK_MODE=true`
- **THEN** all screens SHALL display realistic sample data without any backend or network calls

### Requirement: Mock mode toggle via environment variable

The system SHALL support a `MOCK_MODE` environment variable that switches the app between mock and real data sources. All feature hooks SHALL check this flag and route to mock providers when enabled.

#### Scenario: Toggle between mock and real mode

- **WHEN** a developer changes `MOCK_MODE` from `true` to `false`
- **THEN** the app SHALL switch from mock data to real API calls without any code changes

### Requirement: Full screen navigation with mock data

The system SHALL enable complete navigation through all app screens using mock data: welcome → onboarding → feed (with posts, event cards) → calendar (with events) → tree (with persons and relationships) → chores → settings → family switcher.

#### Scenario: Navigate full app with mocks

- **WHEN** a developer runs the app in mock mode and navigates through all tabs
- **THEN** every screen SHALL render with populated mock data and all interactions (tap, scroll, switch family) SHALL function

### Requirement: Expo local development configuration

The system SHALL include Expo configuration for local development with clear instructions in a README. Starting the app locally SHALL require only `npm install` and `npm run dev:mobile`.

#### Scenario: New developer runs the app

- **WHEN** a developer clones the repo and runs `npm install && npm run dev:mobile`
- **THEN** the Expo dev server SHALL start and the app SHALL be scannable via Expo Go within 2 minutes
