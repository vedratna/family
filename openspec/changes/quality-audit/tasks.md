## 1. Architecture Review

- [x] 1.1 Run `architecture-reviewer` agent against the full codebase; capture findings in a checklist
- [x] 1.2 Triage findings: fix in this PR, defer to follow-up (with OpenSpec proposal), or accept with inline comment
- [x] 1.3 Address quick wins: 7 missing/wrong AppSync resolver mappings fixed (myFamilies routed to wrong handler, 5 queries missing, deleteChore missing), added userByPhone + myInvitations Lambda handler cases

## 2. Coverage Enforcement

- [x] 2.1 Backend: add `test.coverage.thresholds` (branches/lines/functions 95, statements 90) to `vitest.config.ts` and `vitest.integration.config.ts`
- [x] 2.2 Web: add same thresholds to `packages/web/vitest.config.ts`
- [x] 2.3 Shared: add same thresholds (if package has tests) to its vitest config
- [x] 2.4 Review each `coverage.exclude` list: remove any production source file that shouldn't be excluded
- [x] 2.5 Close uncovered branches — added tests for transforms, enrichment, error-utils; 467 tests total (was 315)
- [x] 2.6 Update CI `unit-tests` job to run `test:coverage` instead of `test`

## 3. Type Safety

- [x] 3.1-3.5 GraphQL Code Generator deferred — only 1 `as unknown as` cast in all of web/backend prod code, now fixed to proper Error handling
- [x] 3.6 Removed only `as unknown as` cast in prod code (cognito-client.ts); remaining `as` casts are typed boundary casts at urql response layer (acceptable)
- [x] 3.7 N/A (codegen deferred)

## 4. Bundle Size Budget

- [x] 4.1 Install `size-limit`, `@size-limit/preset-app` as devDeps in the web package
- [x] 4.2 Add `.size-limit.json` with 175KB gzipped budget (actual: 134KB, 30% headroom)
- [x] 4.3 Add `size` npm script to web package
- [x] 4.4 Add `bundle-size` CI job that runs after `build`
- [x] 4.5 Calibrated: 134KB actual → 175KB budget

## 5. Documentation

- [x] 5.1 Update root `README.md`: setup, single-command dev, test/coverage/e2e/size commands, deployment overview
- [x] 5.2 Architecture docs left as-is (frontend doc is mobile-focused; web architecture is self-evident from code)
- [x] 5.3 Updated `docs/quality-standards.md`: coverage thresholds (95%), Playwright E2E flows, CI gate list (8 gates)

## 6. CI Gates

- [x] 6.1 CI workflow now has: lint, typecheck, unit-tests (with coverage thresholds), build, security-audit, e2e-web, bundle-size
- [x] 6.2 Documented in quality-standards.md
- [ ] 6.3 Test by pushing PR and confirm CI runs all 7+ jobs

## 7. Verification

- [x] 7.1 Full local run: lint, typecheck, test:coverage all pass; 467 tests
- [ ] 7.2 Playwright E2E (7 flows) — needs running locally after commit
- [x] 7.3 `npm run size -w @family-app/web` passes (134KB < 175KB budget)
- [x] 7.4 Architecture reviewer findings addressed (7 resolver mappings fixed, 2 handler cases added)
- [ ] 7.5 All changes committed and PR green
