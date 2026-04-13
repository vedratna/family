## Why

The app has 349 unit/integration tests but no end-to-end tests verifying real user flows. A user can't register, create a family, invite a member, post to the feed, and see it all work together — because no test exercises the full stack. E2E tests catch integration gaps that unit tests miss (wrong GraphQL argument names, missing resolvers, broken navigation flows). The quality standards document specifies Detox for mobile E2E and defines 4 critical flows to test.

## What Changes

**Web E2E tests (Playwright):**

- Playwright test suite running against the local dev stack (DynamoDB Local + local GraphQL server + Vite dev server)
- Tests run in real browser (Chromium) against localhost
- Critical user flows tested end-to-end:
  1. Register → Create family → See empty feed
  2. Create post → See it in feed → Add comment → Add reaction
  3. Create event → See it in calendar → RSVP
  4. Add family member → Define relationship → See family tree update
  5. Create chore → Complete it → See status change
  6. Switch family → Verify theme changes + data isolation
  7. Notification preferences → Toggle categories
- Each test starts with a clean database (seed before, teardown after)

**Mobile E2E tests (Detox — scaffold only):**

- Detox configuration and project setup
- One smoke test: app launches and renders feed
- Full mobile E2E deferred until Expo dev client is set up

**CI integration:**

- New CI job: `e2e-tests` using DynamoDB Local service container + Playwright
- Runs after unit tests pass
- Screenshots on failure for debugging

**Test data factory:**

- Reusable functions to create test data via GraphQL mutations
- `createTestUser()`, `createTestFamily()`, `createTestPost()`, etc.
- Used by both Playwright tests and future Detox tests

## Capabilities

### New Capabilities

- `e2e-web-tests`: Playwright test suite with critical user flow coverage against local dev stack
- `e2e-mobile-scaffold`: Detox configuration and smoke test for mobile app
- `test-data-factory`: Reusable GraphQL-based test data creation utilities

### Modified Capabilities

_(None — E2E tests are additive, no existing behavior changes.)_

## Impact

- **New files**: `packages/web/e2e/` directory with Playwright tests, `packages/mobile/e2e/` with Detox config, `packages/shared/src/test-utils/` for data factory
- **New dependencies**: `@playwright/test` (web dev dep), `detox` (mobile dev dep)
- **CI changes**: New `e2e-tests` workflow or job in existing CI
- **Prerequisite**: `real-api-integration` must be complete (E2E tests need working CRUD operations)
- **No changes to**: Application code, backend, infrastructure
