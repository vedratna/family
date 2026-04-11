## ADDED Requirements

### Requirement: Local Express GraphQL API server

The system SHALL include a local Express server with Apollo Server that serves the same GraphQL schema as AppSync. Resolvers SHALL call the actual use cases from `packages/backend/src/use-cases/` with DynamoDB Local as the backing store.

#### Scenario: Start local API server

- **WHEN** a developer runs `npm run dev:api`
- **THEN** a GraphQL server SHALL start on `http://localhost:4000/graphql` serving the full schema with a GraphQL playground

### Requirement: DynamoDB Local integration

The system SHALL use the existing `docker-compose.yml` DynamoDB Local container as the backend for the local API server. The seed script SHALL create the table and populate it with initial data.

#### Scenario: Run full local stack

- **WHEN** a developer runs `npm run dev` (combined command)
- **THEN** DynamoDB Local, the Express API server, and Expo dev server SHALL all start in parallel

### Requirement: Mobile app connects to local API

The system SHALL support configuring the mobile app to point to the local Express API instead of AppSync. The API URL SHALL be configurable via environment variable (`API_URL`).

#### Scenario: Mobile app uses local API

- **WHEN** a developer sets `MOCK_MODE=false` and `API_URL=http://localhost:4000/graphql`
- **THEN** the mobile app SHALL make GraphQL requests to the local Express server

### Requirement: Dev scripts for parallel processes

The system SHALL provide npm scripts: `dev:db` (start DynamoDB Local), `dev:api` (start Express server), `dev:mobile` (start Expo), and `dev` (run all three in parallel using concurrently).

#### Scenario: Single command starts everything

- **WHEN** a developer runs `npm run dev`
- **THEN** all three services SHALL start in parallel with labeled output in the terminal
