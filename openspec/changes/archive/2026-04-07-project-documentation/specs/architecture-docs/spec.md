## ADDED Requirements

### Requirement: System overview document (Level 1)

The documentation SHALL include a system overview file (`docs/architecture/00-overview.md`) that provides a bird's-eye view of the entire system readable in under 5 minutes. It SHALL include: a system architecture diagram showing all major components (mobile app, AppSync, Lambda, DynamoDB, S3, SNS, EventBridge, Cognito), the tech stack summary, monorepo package structure, and a "where does X live?" quick-reference table mapping features to packages/directories.

#### Scenario: New developer reads overview

- **WHEN** a developer opens `docs/architecture/00-overview.md`
- **THEN** they SHALL find a complete system diagram, tech stack list, monorepo structure, and a quick-reference table for locating code — all without needing to read any other file

### Requirement: Backend architecture document (Level 2)

The documentation SHALL include a backend deep-dive file (`docs/architecture/01-backend.md`) covering: clean architecture layer diagram (Handler → Use Case → Repository → Domain), request lifecycle diagram (AppSync → Lambda → Use Case → DynamoDB), layer boundary rules (what each layer can import), dependency injection pattern, domain error types inventory, and the permission system (role hierarchy, requireRole utility).

#### Scenario: Developer needs to understand backend request flow

- **WHEN** a developer reads `docs/architecture/01-backend.md`
- **THEN** they SHALL find a step-by-step request lifecycle diagram showing exactly how a GraphQL request flows through handler, use case, and repository layers with concrete examples

### Requirement: Frontend architecture document (Level 2)

The documentation SHALL include a frontend deep-dive file (`docs/architecture/02-frontend.md`) covering: feature-based module structure diagram, custom hooks as view models pattern, TanStack Query integration, theming system (useTheme hook, 8 accent palettes, light/dark mode, design tokens), navigation structure, and component hierarchy (screens → hooks → shared components).

#### Scenario: Developer needs to understand frontend state management

- **WHEN** a developer reads `docs/architecture/02-frontend.md`
- **THEN** they SHALL find diagrams showing how TanStack Query manages server state, how useTheme resolves family accent + dark mode, and how feature modules are structured

### Requirement: Infrastructure document (Level 2)

The documentation SHALL include an infrastructure file (`docs/architecture/03-infrastructure.md`) covering: CDK stack dependency diagram (which stacks depend on which), AWS service topology, environment configuration (dev/prod stage differences), and deployment flow.

#### Scenario: Developer needs to understand CDK stacks

- **WHEN** a developer reads `docs/architecture/03-infrastructure.md`
- **THEN** they SHALL find a diagram showing all 6 CDK stacks, their dependencies, and the resources each creates

### Requirement: Data model document (Level 2)

The documentation SHALL include a data model file (`docs/architecture/05-data-model.md`) covering: the complete DynamoDB single-table key schema (PK/SK/GSI1/GSI2 for all entity types), the full access patterns table (22 patterns with key conditions and index used), and entity relationship diagrams showing how domain types relate.

#### Scenario: Developer needs to add a new access pattern

- **WHEN** a developer reads `docs/architecture/05-data-model.md`
- **THEN** they SHALL find the complete key schema table and access patterns table, enabling them to understand existing patterns and design new ones consistently

### Requirement: Critical flows document (Level 3)

The documentation SHALL include a critical flows file (`docs/architecture/06-critical-flows.md`) with sequence diagrams for: user registration + first family creation, invite → accept → activation gate unlock, post creation with media upload (presigned URL flow), relationship creation → inference engine execution, family tree build + cache, event creation → EventBridge reminder scheduling → push notification delivery, and re-engagement notification cadence (24h, 1w, 1m).

#### Scenario: Developer needs to understand the inference engine flow

- **WHEN** a developer reads the relationship inference section in `docs/architecture/06-critical-flows.md`
- **THEN** they SHALL find a sequence diagram showing: relationship created → graph fetched → inference rules applied → pending suggestions stored → admin confirmation flow

### Requirement: Shared package document (Level 2)

The documentation SHALL include a shared package file (`docs/architecture/04-shared-package.md`) covering: the type system (all domain types), Zod validation schemas (shared between frontend and backend), constants, and how the shared package is consumed by backend and mobile.

#### Scenario: Developer needs to add a new domain type

- **WHEN** a developer reads `docs/architecture/04-shared-package.md`
- **THEN** they SHALL understand where to define the type, where to add the Zod schema, and how both frontend and backend will consume it
