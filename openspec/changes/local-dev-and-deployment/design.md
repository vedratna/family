## Context

The family-app has a complete codebase but no way to run it. Developers need to see screens on a phone, test business logic locally, push code through PRs, and deploy to AWS. This change builds the operational bridge from code to running app.

## Goals / Non-Goals

**Goals:**
- A developer can see the full app on their phone within 5 minutes of cloning the repo
- Business logic can be tested end-to-end locally without an AWS account
- Code follows a proper PR flow with CI validation before merge
- Deployment to dev is automated; deployment to prod requires manual approval
- Every required credential is documented with setup instructions

**Non-Goals:**
- Production-grade monitoring/alerting (separate concern)
- Custom domain setup for AppSync (later)
- App Store/Play Store submission automation (manual for v1)

## Decisions

### 1. Mock Data Architecture — Provider Pattern

**Decision:** Create a `MockDataProvider` context that mirrors the shape of real API responses. Each feature hook checks if it's in mock mode and returns mock data instead of making API calls.

**Rationale:** This avoids modifying any use case or screen code. The mock layer sits between hooks and API calls — screens are unaware of whether data is real or mocked.

```
REAL MODE:                          MOCK MODE:
Screen → Hook → TanStack Query     Screen → Hook → MockDataProvider
                → AppSync API                → Static mock data
                → Lambda
                → DynamoDB
```

**Implementation:** A single environment variable `MOCK_MODE=true` toggles between real and mock. Hooks use a pattern:

```typescript
function useFeed() {
  const { isMockMode } = useConfig();
  if (isMockMode) return useMockFeed();
  return useRealFeed();
}
```

### 2. Local API Server — Express + Apollo Server

**Decision:** Use Express with Apollo Server to serve the same GraphQL schema locally. Resolvers call the actual use cases with DynamoDB Local as the backing store.

**Rationale:** This gives full backend parity locally — the same business logic (permission checks, activation gate, inference engine) runs against a real database. Apollo Server serves the same `schema.graphql` file used by AppSync, ensuring schema consistency.

**Alternatives considered:**
- *Serverless Offline*: Emulates Lambda + API Gateway but doesn't support AppSync well. Rejected.
- *AWS SAM Local*: Good for Lambda but heavy for development iteration. Rejected for speed.
- *Direct use-case testing*: Already covered by unit tests. Local API adds end-to-end HTTP testing.

### 3. Dev Scripts — Concurrently for Parallel Processes

**Decision:** Use `concurrently` to run DynamoDB Local, Express API, and Expo in parallel with one command.

```
npm run dev
  → concurrently:
    → docker compose up dynamodb-local
    → ts-node packages/backend/src/local-server/index.ts
    → cd packages/mobile && expo start
```

### 4. Deployment — CDK Deploy via GitHub Actions

**Decision:** Use GitHub Actions with environment-specific workflows. Dev deploys automatically on merge to main. Prod requires a manual workflow dispatch with GitHub environment approval.

**Rationale:** Automated dev deploy gives fast feedback. Manual prod deploy with approval gate prevents accidental production changes. GitHub environments provide native approval workflows without third-party tools.

### 5. Mobile Builds — Expo EAS

**Decision:** Use Expo Application Services (EAS) for mobile builds with three profiles:

| Profile | Use | Distribution |
|---------|-----|-------------|
| `development` | Local development with dev client | Internal |
| `preview` | QA testing | Internal (TestFlight / internal track) |
| `production` | App store release | App Store / Google Play |

**Rationale:** EAS handles native builds in the cloud — no Xcode/Android Studio needed locally. Build profiles map cleanly to environments.

### 6. Credentials — Layered by Stage

**Decision:** Credentials are stored in different locations depending on their scope:

| Scope | Storage | Accessed By |
|-------|---------|-------------|
| CI/CD (AWS deploy, Expo) | GitHub Repository Secrets | GitHub Actions |
| Runtime (Google/Apple OAuth, APNs/FCM) | AWS SSM Parameter Store (SecureString) | CDK at deploy time, Lambda at runtime |
| Local development | `.env.local` (gitignored) | Developer's machine only |

### 7. Initial PR Strategy — Layered PRs

**Decision:** Split the existing codebase into 4-5 reviewable PRs rather than one massive initial commit.

**Rationale:** Even though there's no existing code to conflict with, reviewable PRs establish good practice from day one and validate that CI passes at each stage.

## Risks / Trade-offs

**[Mock data drift]** → Mock data may diverge from real API shape as features evolve. Mitigate by deriving mock data types from the same shared types used by the real API.

**[Local API ≠ AppSync]** → Express + Apollo Server doesn't perfectly replicate AppSync's resolver behavior (VTL, auth pipeline). Mitigate by keeping local resolvers as thin wrappers calling the same use cases Lambda calls — the business logic is identical.

**[EAS build times]** → Cloud builds take 10-20 minutes. Mitigate by using local development builds for daily work and EAS only for distribution.

## Open Questions

1. **Single AWS account or separate dev/prod accounts?** Separate is more secure but adds management overhead. For a small team, single account with stage prefixes is pragmatic.
2. **Custom domain for AppSync?** Not needed for v1 but would be nice for the web app (Phase 2).
