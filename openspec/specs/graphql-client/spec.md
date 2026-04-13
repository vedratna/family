## ADDED Requirements

### Requirement: urql client connects to local GraphQL server

The web app SHALL use urql to send GraphQL operations to the local server at `http://localhost:4000/graphql` when `VITE_MOCK_MODE=false`.

#### Scenario: Query returns data from DynamoDB

- **WHEN** web app sends a `familyFeed` query in API mode
- **THEN** urql sends the request to localhost:4000
- **AND** the local server executes GetFamilyFeed use case against DynamoDB Local
- **AND** the page renders with real persisted data

#### Scenario: Mutation persists data

- **WHEN** user submits a create post form
- **THEN** urql sends a `createPost` mutation
- **AND** the post is persisted in DynamoDB Local
- **AND** the feed page refetches and shows the new post

### Requirement: Local GraphQL server calls real use cases

The local server SHALL implement all 33 GraphQL operations by calling the actual use cases with DynamoDB repositories, replacing all stubs.

#### Scenario: All queries return real data

- **WHEN** the local server receives any query (familyFeed, familyEvents, familyChores, etc.)
- **THEN** it calls the corresponding use case with DynamoDB repos
- **AND** returns real data from DynamoDB Local

#### Scenario: All mutations persist data

- **WHEN** the local server receives any mutation
- **THEN** it calls the corresponding use case
- **AND** the data is persisted in DynamoDB Local

### Requirement: Mode toggle switches between mock and API

The web app SHALL support `VITE_MOCK_MODE=true` (static mock data) and `VITE_MOCK_MODE=false` (real API) with the same page components.

#### Scenario: Mock mode uses no network

- **WHEN** `VITE_MOCK_MODE=true`
- **THEN** pages render with static mock data
- **AND** no HTTP requests are made

#### Scenario: API mode uses network

- **WHEN** `VITE_MOCK_MODE=false`
- **THEN** pages send GraphQL requests to the local server
- **AND** data reflects the current database state
