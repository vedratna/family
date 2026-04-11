## Why

The family-app codebase has been built with clean architecture, quality tooling, and comprehensive features — but there is no documentation. New developers have no guide to understand the system, there are no codified quality standards to enforce consistency as the team grows, and end users have no reference for learning the app. Documentation is needed now, before the team scales, to prevent knowledge silos and ensure quality remains high.

## What Changes

- Create developer architecture documentation (`docs/architecture/`) with progressive disclosure: system overview → component deep dives → critical flow sequence diagrams
- Create quality standards specification (`docs/quality-standards.md`) codifying all code quality rules, testing requirements, linting configuration, commit standards, and architecture patterns with rationale and examples
- Create end-user guide documentation (`docs/user-guide/`) with progressive disclosure: quick start → feature overviews → detailed walkthroughs with visual flow diagrams
- No application code changes — this is purely documentation

## Capabilities

### New Capabilities

- `architecture-docs`: Developer-facing architecture documentation with diagrams covering system overview, backend/frontend/infra deep dives, DynamoDB access patterns, and critical flow sequence diagrams
- `quality-standards`: Development team quality specification covering TypeScript strict mode, no defensive/dead code policy, testing pyramid and coverage thresholds, ESLint rules inventory, CI gates, commit standards, PR review checklist, and architecture pattern enforcement
- `user-guide`: End-user documentation covering quick start, feature walkthroughs (feed, calendar, tree, chores, notifications, theming), onboarding flows, and role/permission explanations — all with visual diagrams

### Modified Capabilities

_(None — this change adds documentation only, no existing capability requirements change.)_

## Impact

- **New files**: `docs/architecture/` directory (multiple markdown files), `docs/quality-standards.md`, `docs/user-guide/` directory (multiple markdown files)
- **No code changes**: No application code, tests, or infrastructure are modified
- **Dependencies**: None — pure markdown documentation
- **CI/CD**: No pipeline changes, though quality-standards.md could be referenced in PR templates
