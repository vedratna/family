## 1. Phase 1 — Local Development with Mock Data

- [x] 1.1 Create `packages/mobile/src/mocks/` directory with mock data files
- [x] 1.2 Create mock data: 2 families (Sharma/Teal, Verma/Coral), 6 persons, 4 memberships with roles
- [x] 1.3 Create mock data: 5 relationships (parent-child, spouse, sibling) with bi-directional labels
- [x] 1.4 Create mock data: 8 posts (mix of text-only, with photos, system welcome post), comments, reactions
- [x] 1.5 Create mock data: 3 events (birthday upcoming, anniversary past, exam future), RSVPs
- [x] 1.6 Create mock data: 3 chores (pending, completed, overdue with rotation)
- [x] 1.7 Create mock data: notification preferences (defaults), device tokens
- [x] 1.8 Create mock data: serialized family tree for Sharma family
- [x] 1.9 Create `MockDataProvider` context that exposes all mock data via hooks matching real API shape
- [x] 1.10 Create `useConfig()` hook with `isMockMode` flag reading from environment variable
- [x] 1.11 Update all feature hooks to check `isMockMode` and route to mock providers when true
- [x] 1.12 Create `app.config.ts` for Expo with environment-aware configuration (MOCK_MODE, API_URL)
- [x] 1.13 Wire full navigation: RootNavigator → AuthStack / MainStack (TabNavigator) with all screens connected
- [x] 1.14 Create `App.tsx` entry point wrapping providers: QueryProvider → AuthProvider → FamilyProvider → ThemeProvider → Navigator
- [x] 1.15 Add `dev:mobile` script to root package.json
- [x] 1.16 Write README section: "Running Locally with Mock Data" (prerequisites, steps, what to expect)
- [x] 1.17 Verify: run app on Expo Go, navigate all tabs, switch families, see mock data on every screen

## 2. Phase 2 — Local API Server with DynamoDB Local

- [x] 2.1 Add `express`, `@apollo/server`, `concurrently` as dev dependencies in backend package
- [x] 2.2 Create `packages/backend/src/local-server/index.ts`: Express + Apollo Server serving `schema.graphql`
- [x] 2.3 Create local GraphQL resolvers: thin wrappers calling actual use cases with DI'd DynamoDB repositories
- [x] 2.4 Create local auth middleware: bypass Cognito, accept a `x-user-id` header for testing
- [x] 2.5 Update seed script to populate DynamoDB Local with sample family data (same data as mocks)
- [x] 2.6 Create `.env.example` with all environment variables (DYNAMODB_ENDPOINT, TABLE_NAME, MOCK_MODE, API_URL, etc.)
- [x] 2.7 Add `.env.local` to `.gitignore`
- [x] 2.8 Add npm scripts to root package.json: `dev:db`, `dev:api`, `dev:mobile`, `dev` (concurrently)
- [x] 2.9 Update `useConfig()` hook to read `API_URL` and configure GraphQL client accordingly
- [x] 2.10 Write README section: "Running with Local API" (docker compose up, npm run dev, testing flows)
- [x] 2.11 Verify: start full local stack, create a family via GraphQL playground, see it in the app

## 3. Phase 3 — Cloud Sandbox (Documentation Only)

- [x] 3.1 Write README section: "Cloud Sandbox (Optional)" documenting Amplify sandbox setup
- [x] 3.2 Add `dev:sandbox` script placeholder in package.json
- [x] 3.3 Document tradeoffs: local API (free, fast, offline) vs sandbox (cloud parity, costs money)

## 4. GitHub Repository Setup

- [x] 4.1 Create `docs/ops/github-setup.md`: step-by-step for repo creation, branch protection rules (require PR, require squash, require all 7 CI status checks), GitHub environments (dev auto, prod with reviewers)
- [x] 4.2 Create `docs/ops/initial-pr-strategy.md`: recommended 5-7 PRs in dependency order with what each contains
- [x] 4.3 Create `.github/PULL_REQUEST_TEMPLATE.md` with PR checklist (references quality-standards.md)

## 5. Deployment Pipelines

- [x] 5.1 Create `.github/workflows/deploy-dev.yml`: triggers on push to main after CI, runs CDK diff + deploy --stage dev, smoke test
- [x] 5.2 Create `.github/workflows/deploy-prod.yml`: workflow_dispatch, requires `production` environment approval, CDK diff + deploy --stage prod, smoke test
- [x] 5.3 Create `scripts/smoke-test.sh`: basic health check against deployed AppSync endpoint (query { health })
- [x] 5.4 Create `.github/workflows/eas-build.yml`: triggered manually, runs EAS build for specified profile (development/preview/production)

## 6. Expo EAS Configuration

- [x] 6.1 Create `packages/mobile/eas.json` with development, preview, and production profiles
- [x] 6.2 Update `packages/mobile/app.config.ts` to read EAS environment variables (API_URL, STAGE)
- [x] 6.3 Write `docs/ops/mobile-builds.md`: EAS build commands, profile differences, app store submission steps

## 7. Credentials & Environment Setup

- [x] 7.1 Create `.env.example` at repo root with all variables grouped by service with descriptions
- [x] 7.2 Create `scripts/setup-ssm-params.sh`: interactive script to store secrets in SSM Parameter Store for a given stage
- [x] 7.3 Create `docs/ops/credentials-checklist.md`: full credentials matrix (credential → stage needed → where to get → where to store → consumed by)
- [x] 7.4 Create `docs/ops/aws-bootstrap.md`: IAM user creation, CDK bootstrap, AWS CLI config, first deploy verification
- [x] 7.5 Create `docs/ops/credentials-per-stage.md`: minimum credentials at each stage (local-mock: none, local-api: none, dev-deploy: AWS only, dev-auth: + Google/Apple, prod: all)

## 8. Verification & Documentation

- [x] 8.1 Update root README.md with project overview, quick start commands, and links to all docs
- [x] 8.2 Verify Phase 1: clone → install → dev:mobile → see app with mock data
- [x] 8.3 Verify Phase 2: clone → install → dev → full local stack running
- [x] 8.4 Verify CI: push a test branch, confirm all 7 gates run
- [x] 8.5 Verify deploy: run CDK synth locally to confirm templates generate correctly
