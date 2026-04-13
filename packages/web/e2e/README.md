# E2E Tests (Playwright)

Browser-level end-to-end tests for the web app, running against the local dev stack (DynamoDB Local + GraphQL API + Vite dev server).

## Prerequisites

- Docker running (for DynamoDB Local)
- Node 20+
- Playwright browsers installed: `npx playwright install chromium`

## Running locally

```bash
# Start DynamoDB Local (if not already running)
docker compose up -d dynamodb-local

# Seed demo data
npm run seed

# Run all E2E tests (Playwright starts API + Vite automatically)
npm run test:e2e -w @family-app/web

# Run a specific test file
npx playwright test e2e/chores.spec.ts

# Run in headed mode (see the browser)
npx playwright test --headed

# Open the HTML report after a run
npx playwright show-report packages/web/playwright-report
```

If the API and Vite dev servers are already running, Playwright will reuse them (via `reuseExistingServer`). In CI, it starts them fresh.

## Adding a new test

1. Create `e2e/<flow-name>.spec.ts`.
2. For tests that need a populated family with 2+ members, import `{ test, expect }` from `./helpers/fixtures` and use the `seededFamily` / `authedPage` fixtures.
3. For tests that start from scratch (signup flow), import directly from `@playwright/test`.
4. Use web-first assertions (`expect(locator).toBeVisible()`, `.toHaveText()`) -- never `waitForTimeout`.
5. Seed test data via the factory helpers in `helpers/factories.ts` when you need backend state that is hard to create through the UI.

## Factory conventions

- **`createTestUser(workerIndex, namePrefix?)`** -- registers a user with a unique phone derived from `Date.now()` + worker index.
- **`createTestFamily(userId, name)`** -- creates a family owned by the given user.
- **`addTestMember(inviterUserId, familyId, phone, name)`** -- invites a phone to a family.
- **`acceptTestInvitation(userId, familyId, phone, displayName)`** -- accepts a pending invite.
- **`createTestPost / createTestEvent / createTestChore`** -- create entities via GraphQL.
- **`createTestRelationship`** -- creates a relationship between two persons.

## Auth in tests

The `loginAs(page, userId)` helper writes `family-app-current-user` to localStorage before page load. The app's GraphQL provider reads this and sends `x-user-id` header on every request. No Cognito needed in local mode.

## Media upload mocking

`stubMediaUpload(page)` intercepts `generateUploadUrl` and `confirmMediaUpload` GraphQL calls plus the S3 PUT. Tests assert the mutations were called without hitting real AWS.

## CI

The `e2e-web` job in `.github/workflows/ci.yml` runs after unit tests pass. It uses a DynamoDB Local service container, seeds data, installs Chromium, and runs the suite. On failure, `playwright-report/` is uploaded as an artifact.
