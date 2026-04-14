## Requirements

### Requirement: Web app uses generated GraphQL types

The web app SHALL import types for GraphQL operations from a generated module (`packages/web/src/lib/generated/graphql.ts`) produced by GraphQL Code Generator. Manual type definitions duplicating schema types SHALL be removed.

#### Scenario: Adding a new query uses generated types

- **WHEN** a developer adds a new GraphQL query to the web app
- **THEN** the typed document node is available from the generated module
- **AND** `useQuery`/`useMutation` hook calls use the typed document (no `as unknown as` casts)

#### Scenario: Schema change regenerates types

- **WHEN** the GraphQL schema at `packages/infra/graphql/schema.graphql` changes
- **AND** `npm run codegen` is run (or the pre-build hook runs)
- **THEN** the generated module is updated
- **AND** any type mismatches surface as typecheck errors

### Requirement: No unsafe type casts in web source

The web `src/` tree SHALL NOT contain `as unknown as <T>` casts, except in tests and at well-commented boundary points (e.g., parsing localStorage JSON). An ESLint rule or review discipline SHALL surface new introductions.

#### Scenario: Reviewing web pages for casts

- **WHEN** a reviewer searches for `as unknown as` in `packages/web/src/`
- **THEN** any remaining matches are inside `__tests__/` directories or have a comment explaining the cast
- **AND** page/component files have no such casts
