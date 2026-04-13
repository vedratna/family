## ADDED Requirements

### Requirement: Vite + React project scaffold

The web package SHALL be a Vite + React + TypeScript project at `packages/web/` with standard tooling (lint, typecheck, test, build scripts).

#### Scenario: Dev server starts

- **WHEN** developer runs `npm run dev:web`
- **THEN** Vite dev server starts at `localhost:5173`
- **AND** the app renders in the browser

#### Scenario: Build succeeds

- **WHEN** `npm run build` runs for the web package
- **THEN** Vite produces an optimized production bundle in `dist/`

### Requirement: Client-side routing

The web app SHALL use react-router for client-side navigation with routes for all features.

#### Scenario: Navigation between features

- **WHEN** user clicks the Feed tab
- **THEN** the URL changes to `/feed` and FeedPage renders
- **AND** clicking Calendar navigates to `/calendar`

#### Scenario: Deep linking works

- **WHEN** user opens `/calendar` directly in the browser
- **THEN** CalendarPage renders without requiring navigation from home

### Requirement: Mock data mode

The web app SHALL support a mock data mode toggled by `VITE_MOCK_MODE=true` that provides realistic data to all pages without a backend.

#### Scenario: Mock mode renders all pages

- **WHEN** `VITE_MOCK_MODE=true` is set
- **THEN** all pages render with mock data (families, posts, events, chores, tree, relationships)
- **AND** no network requests are made

### Requirement: Theme system with family switching

The web app SHALL apply the active family's theme (accent color palette + light/dark mode) using CSS variables.

#### Scenario: Theme changes on family switch

- **WHEN** user switches to a family with "coral" theme
- **THEN** accent colors update throughout the UI
- **AND** the header reflects the new family name

### Requirement: Responsive layout

The web app SHALL work on desktop (1200px+) and mobile browsers (360px+) with a responsive sidebar/tab navigation.

#### Scenario: Desktop layout

- **WHEN** viewport width is 1200px+
- **THEN** a sidebar navigation is shown on the left with main content on the right

#### Scenario: Mobile browser layout

- **WHEN** viewport width is below 768px
- **THEN** a bottom tab bar is shown (similar to mobile app)

### Requirement: CI integration

The web package SHALL be included in the CI pipeline with lint, typecheck, and test gates.

#### Scenario: CI validates web package

- **WHEN** a PR is opened with web package changes
- **THEN** lint, typecheck, and test gates run for the web package
- **AND** all must pass for the PR to be mergeable
