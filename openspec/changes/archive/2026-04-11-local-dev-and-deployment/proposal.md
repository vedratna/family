## Why

The family-app codebase is fully built (237 tasks, 121 tests, 15 documentation files) but cannot be run, tested end-to-end, or deployed. There is no way to see the app on a phone, no way to push code through a proper PR flow, and no deployment pipeline. This change establishes the complete operational lifecycle — from "I want to see it on my phone" to "it's live in production."

## What Changes

**Local Development (3 phases):**

- Phase 1: Mock data providers for all screens — immediate visual feel without any backend
- Phase 2: Local Express API server wired to real use cases + DynamoDB Local — test actual business logic
- Phase 3: Cloud sandbox documentation — optional cloud-parity local dev

**GitHub Repository:**

- Branch protection rules, required status checks, squash merge policy
- Initial PR strategy for splitting the existing codebase into reviewable PRs

**Deployment Pipelines:**

- GitHub Actions deploy workflow: auto-deploy to dev on merge to main
- Production deployment workflow: manual trigger with approval gate
- CDK deploy flow (diff → deploy → smoke test)
- Expo EAS configuration for mobile builds (development, preview, production profiles)

**Credentials & Environment:**

- `.env.example` template with all required variables
- SSM Parameter Store setup script for AWS secrets
- Credentials checklist with setup instructions per service
- CDK bootstrap instructions
- Documentation of what credentials are needed at each stage (local → dev → prod)

## Capabilities

### New Capabilities

- `local-dev-mock`: Mock data providers and local development configuration for running the mobile app with realistic sample data, no backend required
- `local-dev-api`: Local Express GraphQL server wired to actual use cases with DynamoDB Local, enabling full backend logic testing locally
- `deployment-pipeline`: GitHub Actions workflows for dev auto-deploy and prod manual deploy, including CDK deployment, Expo EAS builds, and environment configuration
- `credentials-setup`: Environment variable templates, AWS SSM parameter scripts, credentials checklist, and CDK bootstrap instructions

### Modified Capabilities

_(None — this change adds operational infrastructure, no existing feature requirements change.)_

## Impact

- **New files**: Mock data providers in `packages/mobile/src/mocks/`, Express server in `packages/backend/src/local-server/`, GitHub Actions deploy workflows, `eas.json`, `app.config.ts`, `.env.example`, setup scripts
- **Modified files**: `package.json` (new dev scripts), `docker-compose.yml` (add local API), mobile providers (mock mode toggle)
- **Dependencies**: `express`, `@apollo/server` (dev only for local API)
- **No changes to**: Application business logic, domain types, use cases, or existing tests
