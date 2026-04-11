## ADDED Requirements

### Requirement: TypeScript strict mode documentation
The quality standards document SHALL include a section documenting every TypeScript strict compiler flag enabled in the project, with a one-line explanation of what each flag catches and why it matters. Flags SHALL include: strict, noUncheckedIndexedAccess, noImplicitReturns, noFallthroughCasesInSwitch, forceConsistentCasingInFileNames, exactOptionalPropertyTypes.

#### Scenario: Developer wonders why their optional property assignment fails
- **WHEN** a developer reads the TypeScript strict mode section
- **THEN** they SHALL find an explanation of `exactOptionalPropertyTypes` with an example showing why `prop: undefined` is different from omitting the property

### Requirement: No defensive code policy with examples
The quality standards document SHALL include a "No Defensive Code" section with concrete before/after code examples for each banned pattern: null-checking TypeScript-guaranteed non-null values, try/catch around non-throwing code, typeof checks on already-typed values, fallback defaults for required parameters, commented-out code blocks, unused imports/variables/parameters, empty catch blocks, and redundant else after return.

#### Scenario: Developer reviews code with unnecessary null check
- **WHEN** a developer references the no-defensive-code section
- **THEN** they SHALL find a clear BAD/GOOD example showing the exact pattern and why it violates the policy

### Requirement: No dead code policy
The quality standards document SHALL document the no-dead-code policy: no commented-out code (git remembers), no unused imports/variables/functions, no unreachable code after return/throw. It SHALL reference the specific ESLint rules that enforce this: no-unused-vars, no-unreachable.

#### Scenario: PR review flags commented-out code
- **WHEN** a reviewer references the no-dead-code policy
- **THEN** they SHALL find the rule stating that removed code is deleted, not commented, with a reference to the ESLint rules that automate detection

### Requirement: Testing standards documentation
The quality standards document SHALL document: testing pyramid ratios (75% unit, 20% integration, 5% E2E), coverage thresholds (80% minimum overall, 100% for use-cases/), what to test at each level (unit: use cases with mocked repos, domain logic, hooks, components; integration: Lambda + DynamoDB Local; E2E: Detox critical flows), test runner configuration (Vitest), and prohibited testing patterns (no testing implementation details, no snapshot-only tests).

#### Scenario: Developer writes their first test
- **WHEN** a developer reads the testing standards section
- **THEN** they SHALL understand what coverage threshold to meet, which test runner to use, and see an example of a properly structured use-case unit test with mocked repositories

### Requirement: ESLint rules inventory
The quality standards document SHALL include a complete inventory of all custom ESLint rules beyond defaults, with each rule name, what it catches, and why it's enabled. Rules SHALL include: no-explicit-any, no-floating-promises, strict-boolean-expressions, no-unused-vars, no-unnecessary-condition, no-redundant-type-constituents, no-useless-constructor, no-else-return, no-unreachable, import/no-cycle, boundaries/element-types.

#### Scenario: Developer wants to understand why their code fails linting
- **WHEN** a developer looks up a specific ESLint rule in the inventory
- **THEN** they SHALL find the rule name, a description of what it catches, and the rationale for why it's enabled

### Requirement: CI/CD gates documentation
The quality standards document SHALL document all 7 CI pipeline gates (lint & format, type check, unit tests, integration tests, build check, bundle size check, security audit), their run order (parallel where possible), and the requirement that all must pass before PR merge.

#### Scenario: Developer's PR is blocked by CI
- **WHEN** a developer reads the CI gates section
- **THEN** they SHALL find all 7 gates described, understand which run in parallel vs sequentially, and know that all must pass for merge

### Requirement: Architecture pattern enforcement
The quality standards document SHALL document the clean architecture layer rules enforced by eslint-plugin-boundaries: domain imports nothing, use-cases import only domain + repository interfaces, repositories import only domain + interfaces, handlers import everything. It SHALL include a dependency direction diagram.

#### Scenario: Developer's import is rejected by boundaries plugin
- **WHEN** a developer reads the architecture patterns section
- **THEN** they SHALL find a diagram showing allowed import directions and a table listing what each layer can and cannot import

### Requirement: PR review checklist
The quality standards document SHALL include a PR review checklist with items: layer boundaries followed, input validated at API boundary with Zod, permissions checked before business logic, DynamoDB access pattern documented, error cases use typed domain errors, tests cover happy path AND edge cases, no business logic in handlers or screens.

#### Scenario: Reviewer uses the checklist
- **WHEN** a reviewer references the PR checklist
- **THEN** they SHALL find a copy-pasteable checklist covering all quality dimensions
