## ADDED Requirements

### Requirement: Dev deployment workflow (auto on merge)

The system SHALL include a GitHub Actions workflow that automatically deploys to the dev environment when code is merged to the main branch. The workflow SHALL: run CDK diff, deploy all stacks with `--stage dev`, and run a smoke test against the deployed API.

#### Scenario: PR merged to main triggers dev deploy

- **WHEN** a PR is merged to main and CI passes
- **THEN** the deploy-dev workflow SHALL trigger, deploy CDK stacks to dev, and report success/failure

### Requirement: Production deployment workflow (manual with approval)

The system SHALL include a GitHub Actions workflow for production deployment that requires manual trigger (`workflow_dispatch`) and GitHub environment approval from at least one reviewer. The workflow SHALL: show CDK diff for review, deploy with `--stage prod`, and run smoke tests.

#### Scenario: Production deploy requires approval

- **WHEN** a developer triggers the production deploy workflow
- **THEN** the workflow SHALL pause for environment approval before deploying

### Requirement: Expo EAS build configuration

The system SHALL include an `eas.json` configuration with three build profiles: `development` (internal distribution, dev client), `preview` (internal distribution, production-like), and `production` (App Store/Play Store submission).

#### Scenario: Build preview for QA testing

- **WHEN** a developer runs `eas build --profile preview`
- **THEN** EAS SHALL build iOS and Android binaries for internal distribution

### Requirement: Environment-aware mobile configuration

The system SHALL include an `app.config.ts` that reads environment variables to configure: API URL (local vs dev vs prod AppSync), stage name, and feature flags. The configuration SHALL be baked into the build at build time via EAS environment variables.

#### Scenario: Production build points to prod API

- **WHEN** a production EAS build is created
- **THEN** the app SHALL be configured with the production AppSync URL and production stage

### Requirement: GitHub repository configuration guide

The system SHALL include documentation for GitHub repository setup: branch protection rules (require PR, require status checks, require squash merge), required status checks (all 7 CI gates), and GitHub environment configuration (dev auto-deploy, prod with reviewers).

#### Scenario: Developer reads setup guide

- **WHEN** a developer reads the GitHub setup guide
- **THEN** they SHALL be able to configure branch protection and environments following the step-by-step instructions

### Requirement: Initial PR strategy documentation

The system SHALL include documentation defining how to split the existing codebase into reviewable PRs for the initial push: recommended PR order, what each PR contains, and dependencies between PRs.

#### Scenario: Team plans initial code push

- **WHEN** the team reads the PR strategy doc
- **THEN** they SHALL have a clear plan for 5-7 PRs in dependency order, each independently reviewable and CI-validated
