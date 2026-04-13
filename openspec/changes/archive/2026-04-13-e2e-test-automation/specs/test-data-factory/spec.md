## ADDED Requirements

### Requirement: Test data factory helpers exist

The web E2E suite SHALL include factory helpers at `packages/web/e2e/helpers/` for creating test data via GraphQL. Factories SHALL encapsulate the minimum set of mutations needed to reach a state (e.g., "family with 2 members and 1 post").

#### Scenario: createTestUser returns a usable user

- **WHEN** a test calls `createTestUser()`
- **THEN** a user is registered via the `register` mutation with a unique phone
- **AND** the returned object includes `id`, `phone`, `displayName`

#### Scenario: createTestFamily creates family and returns owner context

- **WHEN** a test calls `createTestFamily(userId, name)`
- **THEN** a family is created via `createFamily`
- **AND** the returned object includes `familyId`, `personId` for the owner

#### Scenario: Factory helpers are shared via import

- **WHEN** multiple test files import the same factory helper
- **THEN** the implementation lives in one module and is imported by each test file
- **AND** no test file duplicates GraphQL mutation strings

### Requirement: loginAs helper sets auth context

A `loginAs(page, userId)` helper SHALL configure the Playwright page so that subsequent requests identify as the given user (via `x-user-id` header and/or localStorage state the app reads).

#### Scenario: loginAs works before first navigation

- **WHEN** `loginAs(page, "user-1")` is called before `page.goto("/")`
- **THEN** the app treats the session as user-1 without going through the Cognito login screen
- **AND** `myFamilies` returns user-1's families
