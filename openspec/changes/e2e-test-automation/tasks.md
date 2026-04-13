## 1. Playwright Setup

- [x] 1.1 Add `@playwright/test` to `packages/web` devDependencies
- [x] 1.2 Run `npx playwright install chromium` and commit lockfile updates
- [x] 1.3 Create `packages/web/playwright.config.ts` with chromium project, webServer config (api + vite), retries, traces
- [x] 1.4 Add `test:e2e` script to `packages/web/package.json`
- [x] 1.5 Add `packages/web/playwright-report/` and `packages/web/test-results/` to `.gitignore`

## 2. Helpers / Factory

- [x] 2.1 Create `packages/web/e2e/helpers/graphql.ts` with `gqlRequest(query, variables, userId?)` POST helper
- [x] 2.2 Create `packages/web/e2e/helpers/factories.ts` with `createTestUser`, `createTestFamily`, `addTestMember`, `createTestPost`
- [x] 2.3 Create `packages/web/e2e/helpers/auth.ts` with `loginAs(page, userId)` setting localStorage/header
- [x] 2.4 Create `packages/web/e2e/helpers/fixtures.ts` exporting Playwright `test` extended with common fixtures

## 3. Critical Flow Tests

- [x] 3.1 `e2e/register-and-create-family.spec.ts` — signup + createFamily + empty feed
- [x] 3.2 `e2e/feed-post-lifecycle.spec.ts` — create post, comment, react
- [x] 3.3 `e2e/events-and-rsvp.spec.ts` — create event, RSVP
- [x] 3.4 `e2e/chores.spec.ts` — create, complete, delete
- [x] 3.5 `e2e/invite-flow.spec.ts` — invite + cross-context accept
- [x] 3.6 `e2e/family-tree.spec.ts` — add member + relationship, verify tree
- [x] 3.7 `e2e/profile-photo.spec.ts` — upload via Settings with mocked S3 PUT

## 4. Media Upload Mocking

- [x] 4.1 Add route interception helper to stub `generateUploadUrl` returning a local blob URL
- [x] 4.2 Stub the S3 PUT to respond 200 immediately
- [x] 4.3 Verify `confirmMediaUpload` is called with the expected s3Key

## 5. CI Integration

- [x] 5.1 Add `e2e-web` job to `.github/workflows/ci.yml` with dynamodb service container
- [x] 5.2 Install Chromium with `npx playwright install --with-deps chromium`
- [x] 5.3 Run `npm run test:e2e --workspace @family-app/web`
- [x] 5.4 Upload `playwright-report` artifact on failure
- [x] 5.5 Wire job to run after `unit-tests` passes

## 6. Documentation

- [x] 6.1 Add `packages/web/e2e/README.md` documenting how to run tests locally, how to add new tests, and the factory conventions
- [x] 6.2 Update top-level README with a reference to the E2E suite

## 7. Verification

- [ ] 7.1 All 7 flow tests pass locally
- [ ] 7.2 CI `e2e-web` job passes on a test PR
- [ ] 7.3 Intentionally break a feature, verify E2E catches it
- [ ] 7.4 Add required-status-check for `e2e-web` on main branch protection
- [ ] 7.5 Lint, typecheck, unit tests, scripts/e2e-test.sh all still pass
