## Context

The app has 315 unit/integration tests and a `scripts/e2e-test.sh` that exercises GraphQL via curl. What's missing: browser-level E2E tests that verify user flows through the actual React UI — form submissions, router navigation, optimistic updates, error states. Playwright is the de-facto standard for modern web E2E and supports the Chromium/Vite dev stack out of the box.

## Goals / Non-Goals

**Goals:**

- Playwright test suite covering critical browser user flows against a clean local stack
- CI job that spins up DynamoDB Local + API + Vite, runs Playwright, uploads traces/screenshots on failure
- Reusable test helpers for seeding users/families/posts via GraphQL (faster than UI for setup)
- Deterministic: each test uses isolated data (unique phone numbers, dedicated user IDs)

**Non-Goals:**

- Mobile Detox setup (defer to separate change — needs Expo dev client)
- Visual regression testing (screenshot diffing)
- Cross-browser matrix (Chromium only for now)
- Testing against deployed AWS stack (local dev stack only; post-deploy smoke tests are separate)
- Replacing `scripts/e2e-test.sh` (keep it — fast sanity check at the GraphQL layer)

## Decisions

### 1. Playwright over Cypress

Playwright has better monorepo support, faster execution, native TypeScript, parallel test workers, and better trace viewer. Cypress was ruled out for its single-tab limitation and slower dev loop.

### 2. Test location: `packages/web/e2e/`

E2E tests live alongside the web package but separate from unit tests (`src/**/__tests__/`). Playwright config at `packages/web/playwright.config.ts`. This keeps the dep (`@playwright/test`) scoped to the web package.

### 3. Stack startup: Playwright's `webServer` config

Playwright can spawn and wait on dev servers. Config will define two webServers:

- `npm run dev:api` (backend GraphQL on :4000) — depends on DynamoDB Local being up
- `npm run dev:web` (Vite on :5173)

DynamoDB Local runs via `docker-compose up -d dynamodb` as a pretest hook (not managed by Playwright — it needs to be ready before the API starts). In CI, the docker-compose service runs as a GitHub Actions service container.

### 4. Test data strategy: GraphQL seeding, unique phones per test

Each test creates its own user via `register` mutation with a unique phone number (`+91${Date.now()}${workerId}`). No cleanup needed — test data is disposable, and the local DynamoDB is reset between CI runs. This avoids flakiness from shared fixtures.

The existing demo seed data (Mickey/Bart) stays untouched as a "system under test" baseline — tests that need a populated family log in as `user-1`.

### 5. Authentication in tests: header bypass

Local dev accepts `x-user-id` header; Cognito auth is prod-only. Playwright tests set this header via `page.setExtraHTTPHeaders` (or via localStorage write before navigation — whichever the web app reads). Since production auth is covered by the Cognito integration tests in the backend, E2E tests focusing on UI flows can safely use the dev bypass.

### 6. Test helpers: `packages/web/e2e/helpers/`

- `graphql.ts` — raw GraphQL POST helper (for seeding)
- `factories.ts` — `createTestUser()`, `createTestFamily()`, `addTestMember()`, etc.
- `auth.ts` — `loginAs(page, userId)` — sets localStorage/header
- `fixtures.ts` — Playwright `test.extend` with `seededFamily` fixture

### 7. CI job

New GitHub Actions job `e2e-web` (in existing CI workflow):

```yaml
services:
  dynamodb:
    image: amazon/dynamodb-local
    ports: [8000:8000]
steps:
  - checkout, node setup, npm ci
  - build shared/backend
  - npx playwright install --with-deps chromium
  - npm run test:e2e --workspace @family-app/web
  - upload playwright-report on failure
```

Runs after `unit-tests` passes. Timeout 10 min. Retries 1x on flake.

### 8. Critical flows covered

1. **Register + create family** — new user signs up, creates family, sees empty feed
2. **Post to feed** — login as demo, create post (with + without media), see it appear, comment, react
3. **Events + RSVP** — create event, see on calendar, RSVP from another member
4. **Chores** — create chore, assign, complete, delete
5. **Invite flow** — invite phone, switch user, accept, see new family
6. **Tree + relationships** — add member with relationship label, see tree render
7. **Profile photo** — upload via Settings, see avatar in AppHeader + Members

Media tests stub S3 (don't hit real AWS) — they verify the form + mutation wiring, not the S3 PUT itself. S3 integration is covered by the scripts/e2e-test.sh + manual dev testing.

## Risks / Trade-offs

**[Flaky tests from timing]** → Use Playwright's auto-waiting (`expect(locator).toBeVisible()`) not `waitForTimeout`. Retry 1x in CI. Traces uploaded on failure for debugging.

**[Slow CI]** → E2E adds ~5 min to CI. Acceptable cost for the safety net. Run in parallel with unit tests where possible.

**[Stack startup flakiness]** → DynamoDB Local occasionally fails to start in CI. Health-check loop with timeout before API server starts. If still flaky, consider pre-built container image with warmed state.

**[Dev stack drift vs prod]** → E2E only tests local-server path (Apollo), not Lambda handlers path (AppSync). Lambda handlers covered by unit tests + post-deploy smoke tests (separate change). Document this gap.

**[Media uploads]** → Real S3 PUT from Playwright would require AWS creds in CI and is brittle. Decision: mock the presigned URL generation in test mode (route interception) to return a local blob URL; assert the mutation carries the right mediaId shape.

## Migration Plan

1. Add `@playwright/test` to web package devDeps
2. `npx playwright install chromium`
3. Create `packages/web/playwright.config.ts`, `packages/web/e2e/` structure
4. Port `scripts/e2e-test.sh` flows into Playwright tests one-by-one
5. Add CI job; run locally first, then enable required-status-check
6. Keep `e2e-test.sh` as fast smoke test (it runs <10s; Playwright is ~2min)

Rollback: E2E tests are additive. Disabling = removing the CI job.
