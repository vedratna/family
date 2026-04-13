## Purpose

Playwright-based end-to-end tests that drive the web app in Chromium against the local dev stack (DynamoDB Local + Apollo Server + Vite). Complements unit tests by catching integration bugs in the UI → GraphQL → database path.

## Requirements

### Requirement: Playwright test suite exists for the web app

The web package SHALL include a Playwright test suite at `packages/web/e2e/` covering critical user flows. The suite SHALL be runnable via `npm run test:e2e` from the web workspace.

#### Scenario: E2E suite runs against local stack

- **WHEN** a developer runs `npm run test:e2e` in `packages/web`
- **THEN** Playwright starts DynamoDB Local, API server, and Vite dev server
- **AND** executes all tests in a real Chromium browser
- **AND** exits with non-zero status if any test fails

#### Scenario: Traces and screenshots captured on failure

- **WHEN** a Playwright test fails
- **THEN** a trace and screenshot are written to `packages/web/playwright-report/`
- **AND** in CI, the report is uploaded as an artifact

### Requirement: Critical user flows are covered

The Playwright suite SHALL cover the following end-to-end flows, each as an independent test with its own seeded data:

- Register a new user, create first family, see empty feed
- Post to a populated family (text), see it appear, add comment, react
- Create an event, see it on calendar, RSVP
- Create a chore, complete it, delete it
- Invite by phone, accept from another session, see new family membership
- Add a family member with a relationship label, see it in the tree view
- Upload profile photo via Settings (mocked S3), see avatar update

#### Scenario: Register + create family

- **GIVEN** a fresh user with a unique phone number
- **WHEN** the user completes the signup flow and creates a family
- **THEN** the feed shows an empty-state message
- **AND** `myFamilies` query returns the new family

#### Scenario: Post lifecycle

- **GIVEN** a user who is a member of a family with 2+ members
- **WHEN** the user submits a text post
- **THEN** the post appears at the top of the feed
- **AND** adding a comment increments `commentCount`
- **AND** adding a reaction increments `reactionCount`

#### Scenario: Invite + accept cross-session

- **GIVEN** user A invites a phone number
- **WHEN** user B registers with that phone in a new browser context
- **THEN** user B sees the invitation in `myInvitations`
- **AND** after accepting, user B sees the family in `myFamilies`

### Requirement: Test isolation via unique seed data

Each Playwright test SHALL seed its own test data using unique identifiers (timestamp + worker index) to avoid cross-test pollution. Tests SHALL NOT depend on order of execution.

#### Scenario: Parallel test execution is safe

- **WHEN** Playwright runs tests in parallel across workers
- **THEN** each test creates users with distinct phone numbers
- **AND** no test sees data created by another test

### Requirement: CI runs the E2E suite

The CI pipeline SHALL include a job `e2e-web` that runs the Playwright suite on every PR and push to main. The job SHALL use DynamoDB Local as a service container and install Chromium before running tests.

#### Scenario: E2E job blocks merge on failure

- **WHEN** a Playwright test fails on a PR
- **THEN** the `e2e-web` job reports failure
- **AND** the branch protection prevents merge until it passes (once enabled as required check)
