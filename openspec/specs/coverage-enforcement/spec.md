## Requirements

### Requirement: Coverage thresholds fail CI below 95%

Each testable package SHALL enforce a 95% floor on branches, lines, and functions (90% statements) via its vitest config. Running `npm run test:coverage` locally SHALL report the same failure as CI.

#### Scenario: CI fails on coverage regression

- **GIVEN** the backend package has 95% branch coverage
- **WHEN** a PR introduces a new branch without test coverage that drops branch coverage to 94.8%
- **THEN** `npm run test:coverage` exits with non-zero status
- **AND** CI marks the unit-tests job as failed

#### Scenario: Coverage command reports totals per package

- **WHEN** `npm run test:coverage` runs in a package
- **THEN** v8 reporter writes a summary to stdout with branches/lines/functions/statements percentages
- **AND** an HTML report is written to `coverage/` for local inspection

### Requirement: Coverage exclusions are documented

The `coverage.exclude` list in each vitest config SHALL only contain patterns for files that are not meaningfully testable (type declarations, generated code, main entry points, test setup). Every exclusion SHALL be either self-evident or accompanied by a comment explaining why.

#### Scenario: Reviewing exclusion list

- **WHEN** a reviewer reads a vitest config
- **THEN** each exclude pattern is either a standard category (types, generated, setup) or has a comment
- **AND** no production source file is silently excluded
