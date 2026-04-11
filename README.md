# FamilyApp

A privacy-first family app for extended families to connect, share, and organize together.

## Quick Start (Mock Data — No Backend Needed)

```bash
# 1. Clone and install
git clone <repo-url>
cd family
npm install

# 2. Start the mobile app
npm run dev:mobile

# 3. Scan the QR code with Expo Go on your phone
#    Or press 'i' for iOS simulator / 'a' for Android emulator
```

The app starts in **mock mode** by default — all screens show realistic sample data (2 families, posts, events, tree, chores) without any backend.

## Running with Local API

For testing real business logic with DynamoDB Local:

```bash
# Prerequisites: Docker Desktop running

# 1. Start everything (DynamoDB + API + Mobile)
npm run dev

# 2. Seed the database (first time only)
npx ts-node packages/backend/src/repositories/dynamodb/seed.ts

# 3. Set mock mode off in packages/mobile/.env.local
MOCK_MODE=false
API_URL=http://localhost:4000/graphql
```

## Running Tests

```bash
npm run test              # All unit tests
npm run test:coverage     # With coverage report
npm run typecheck         # Type checking
npm run lint              # ESLint
npm run format:check      # Prettier
```

## Project Structure

```
packages/
├── shared/    ← Types, Zod validation, constants
├── backend/   ← Lambda handlers, use cases, repositories
├── mobile/    ← React Native (Expo) app
└── infra/     ← AWS CDK stacks
```

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

| Layer | Technology |
|-------|-----------|
| Mobile | React Native (Expo) |
| API | AWS AppSync (GraphQL) |
| Auth | AWS Cognito |
| Database | DynamoDB (single-table) |
| Media | S3 + presigned URLs |
| Notifications | SNS + EventBridge |
| Infra | AWS CDK (TypeScript) |
| Monorepo | Turborepo |
| Testing | Vitest (121 tests) |
