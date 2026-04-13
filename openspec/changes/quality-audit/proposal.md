## Why

Iterative development with parallel agents accelerated delivery but accumulated quality debt. Per the user's "no compromise" standard, we need a final sweep before calling the project done. The audit on 2026-04-13 found 84 issues — most fixed by the 4 web polish PRs, but quality concerns (test coverage, type safety, architectural consistency) need a dedicated review pass.

## What Changes

**Coverage tightening:**

- Backend integration tests: branch coverage threshold 94% → 95% (currently fails by 0.6%)
- Web component tests: add tests for Toggle, ConfirmModal interactions not yet covered
- Add tests for `error-utils`, `transforms`, `permissions` helpers
- Per-file coverage exclusions reviewed; remove anything that should be tested

**Type safety:**

- Hunt down all `as unknown as`, `as <Type>` casts in web pages
- Replace with proper typing where possible (typed urql hooks, generated types from schema)
- Consider GraphQL Code Generator to eliminate manual type assertions

**Architecture review:**

- Run architecture-reviewer agent against the full codebase
- Address: dead code, unused parameters, defensive code, swallowed exceptions, missing retry/error handling, thread safety gaps, interface violations, config duplication
- Validate boundaries plugin still passes (no cross-layer imports)

**Documentation:**

- Update README with current setup steps (single-command dev, test commands)
- Architecture docs: refresh anything stale after the polish work
- Quality standards doc: confirm all rules still hold

**Process:**

- Verify CI gates: lint, typecheck, test, build all required for PR merge
- Add coverage gate to CI (currently runs but doesn't enforce)
- Add bundle size check (was in original quality-standards but never built)

## Capabilities

### Modified Capabilities

- All — this is a quality pass, not a feature

## Impact

- **Modified files**: many small fixes across the codebase
- **Possibly new files**: GraphQL Code Generator config + generated types directory
- **CI changes**: enforce coverage thresholds, add bundle size gate
- **Prerequisite**: All other production-blocker changes done first (so we audit the final shape, not intermediate state)
