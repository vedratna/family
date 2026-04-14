## ADDED Requirements

### Requirement: Web bundle has a size budget enforced in CI

The web package SHALL have a `size-limit` configuration setting the initial bundle to <300KB gzipped and lazy chunks to <100KB gzipped each. CI SHALL run `size-limit` post-build and fail the job when budgets are exceeded.

#### Scenario: Adding a large dependency trips the budget

- **GIVEN** the initial bundle is 280KB gzipped
- **WHEN** a PR adds a dependency that pushes the initial bundle to 310KB gzipped
- **THEN** the `bundle-size` CI job fails
- **AND** the job output names the dependencies whose size grew

#### Scenario: Budget changes require explicit PR review

- **WHEN** a PR modifies `.size-limit.json` (or equivalent config)
- **THEN** the diff is visible in review
- **AND** a reviewer can reject a budget bump that isn't justified

### Requirement: Bundle size is reported locally

The command `npm run size` (or equivalent) in the web package SHALL produce the same report CI produces, so developers can check budgets before pushing.

#### Scenario: Developer checks bundle size locally

- **WHEN** a developer runs `npm run size` in `packages/web`
- **THEN** size-limit prints each configured budget, actual size, and pass/fail status
- **AND** the exit code matches CI behavior
