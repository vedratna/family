# FamilyApp

A privacy-first family coordination platform for extended families to connect, share, and organize together. Built with React (web), React Native/Expo (mobile), and AWS serverless (AppSync, Lambda, DynamoDB, Cognito, S3).

## Quick Start

```bash
# Prerequisites: Node 20+, Docker Desktop running

# 1. Clone and install
git clone <repo-url>
cd family
npm install

# 2. Start everything (DynamoDB Local + GraphQL API + Vite web app)
npm run dev

# 3. Open http://localhost:5173 — log in as a demo user (Mickey Mouse / Bart Simpson)
```

Single command `npm run dev` starts DynamoDB Local (Docker), seeds demo data, runs the GraphQL API on `:4000`, and the web app on `:5173`. The web app talks to the real local API with full CRUD.

### Mock Mode (No Docker)

```bash
npm run dev:web:mock   # Vite dev server with in-memory mock data
```

### Mobile App

```bash
npm run dev:mobile     # Expo Go — scan QR code
```

## Running Tests

```bash
npm run test                # All unit tests (315+)
npm run test:coverage       # With coverage report (95% threshold enforced)
npm run typecheck           # Type checking (strict mode)
npm run lint                # ESLint (strict + type-aware rules)

# E2E tests (requires Docker + Playwright Chromium)
npx playwright install chromium          # first time only
npm run test:e2e -w @family-app/web      # 7 critical user flows

# Curl-based API smoke test
scripts/e2e-test.sh                      # runs against local API on :4000
```

See [packages/web/e2e/README.md](packages/web/e2e/README.md) for Playwright E2E details.

## Project Structure

```
packages/
├── shared/    ← Types, constants, shared interfaces
├── backend/   ← Lambda handlers, use cases, repositories, local Apollo server
├── web/       ← Vite + React 19 + Tailwind CSS v4 + urql
├── mobile/    ← React Native (Expo SDK 54)
└── infra/     ← AWS CDK stacks (auth, API, storage, notifications)
```

## CI Pipeline

Every PR runs: lint, typecheck, unit tests (with coverage thresholds), build, security audit, and Playwright E2E tests. All checks must pass before merge.

## Documentation

- [Architecture Overview](docs/architecture/00-overview.md)
- [Backend Deep Dive](docs/architecture/01-backend.md)
- [Frontend Deep Dive](docs/architecture/02-frontend.md)
- [Data Model](docs/architecture/05-data-model.md)
- [Critical Flows](docs/architecture/06-critical-flows.md)
- [Quality Standards](docs/quality-standards.md)
- [User Guide](docs/user-guide/00-quick-start.md)

## Deployment

See [AWS Bootstrap Guide](docs/ops/aws-bootstrap.md) and [Credentials Checklist](docs/ops/credentials-checklist.md).

## Tech Stack

| Layer         | Technology                           |
| ------------- | ------------------------------------ |
| Web           | React 19, Vite, Tailwind CSS v4      |
| Mobile        | React Native (Expo SDK 54)           |
| API           | AWS AppSync (GraphQL) + Apollo local |
| Auth          | AWS Cognito (phone OTP)              |
| Database      | DynamoDB (single-table design)       |
| Media         | S3 + presigned URLs                  |
| Notifications | SNS + EventBridge                    |
| Infra         | AWS CDK (TypeScript)                 |
| Monorepo      | Turborepo + npm workspaces           |
| Testing       | Vitest (315+ tests) + Playwright E2E |
