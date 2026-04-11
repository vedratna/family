# Initial PR Strategy

How to split the existing codebase into reviewable PRs for the first push.

## PR Order (Dependency-Ordered)

```
PR #1 ──▶ PR #2 ──▶ PR #3 ──▶ PR #4 ──▶ PR #5
scaffold   infra    types+db   features   docs+ops
```

### PR #1: Project Scaffold + Quality Infrastructure
**Branch:** `feat/scaffold`

Contains:
- Turborepo config (`turbo.json`, root `package.json`)
- TypeScript strict config (`tsconfig.base.json`)
- ESLint config (`eslint.config.mjs`, boundaries plugin)
- Prettier config (`.prettierrc`, `.prettierignore`)
- Husky + lint-staged + commitlint
- GitHub Actions CI workflow (`.github/workflows/ci.yml`)
- Vitest config for all packages
- Empty package scaffolds (shared, backend, mobile, infra)
- Theming system (all design tokens, 8 palettes, contrast tests)

**Validates:** CI pipeline runs, all 7 gates pass on empty project.

### PR #2: AWS Infrastructure (CDK)
**Branch:** `feat/infra`
**Depends on:** PR #1

Contains:
- 6 CDK stacks (auth, database, storage, api, notification, scheduler)
- GraphQL schema
- CDK entry point (`app.ts`)

**Validates:** `cdk synth` succeeds in CI.

### PR #3: Domain Types, DynamoDB Design, Shared Package
**Branch:** `feat/domain`
**Depends on:** PR #1

Contains:
- All shared types (10 type files)
- All Zod validation schemas (6 files)
- DynamoDB access patterns documentation
- Key builders and DynamoDB operations
- Domain errors
- Permission check utility

**Validates:** Type check + key builder tests pass.

### PR #4: Backend + Mobile Features
**Branch:** `feat/features`
**Depends on:** PR #3

Contains:
- All use cases (auth, family, relationships, tree, feed, calendar, notifications, media, chores)
- All repository interfaces
- DynamoDB repository implementation (user-repo)
- All mobile screens and components
- Mock data providers + local dev config
- App.tsx entry point

**Validates:** All 121 tests pass. App starts with mock data.

### PR #5: Documentation + Deployment
**Branch:** `feat/docs-ops`
**Depends on:** PR #1

Contains:
- Architecture docs (7 files)
- Quality standards
- User guide (7 files)
- Deployment workflows (dev, prod, EAS)
- Credentials docs and setup scripts
- README.md

**Validates:** No code changes — documentation review only.

## Tips

- PRs 1, 3, and 5 can be reviewed in parallel (no dependencies between them after PR #1 merges)
- PR #4 is the largest — consider splitting further if the team prefers smaller reviews
- Each PR should pass CI independently
