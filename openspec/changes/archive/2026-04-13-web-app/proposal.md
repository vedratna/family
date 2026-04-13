## Why

The family-app was designed as mobile-first but the original proposal explicitly calls out a React web app as Phase 2. With the backend API fully wired (after Changes 1 and 2), adding a web client is straightforward — it consumes the same GraphQL API with the same shared types. A web app also provides the fastest way to test and demo the full application without simulator/Expo Go friction.

## What Changes

**New `packages/web` package:**

- Vite + React (TypeScript) — lightweight, fast dev server, no SSR needed
- Consumes `@family-app/shared` for domain types and validation schemas
- GraphQL client (urql) connecting to AppSync with Cognito auth
- Responsive layout — works on desktop and mobile browsers

**Feature screens (matching mobile):**

- Auth: phone login, OTP verification, social login buttons
- Feed: post list, create post, comments, reactions
- Calendar: agenda view, month view, event detail, create event
- Family tree: tree visualization, person relationships
- Chores: chore list, complete/rotate
- Family management: members list, invite, settings, theme picker
- Notifications: preference management

**Local development:**

- `dev:web` script running Vite dev server on `localhost:5173`
- Mock data mode (same mock data as mobile, via shared provider pattern)
- Real API mode pointing to deployed AppSync endpoint
- Add to root `dev` concurrently command

**Testing:**

- Vitest for unit tests (hooks, utilities, data transforms)
- React Testing Library for component tests
- Coverage target: 95% minimum
- Add to CI pipeline (lint, typecheck, test gates)

## Capabilities

### New Capabilities

- `web-app-shell`: Vite + React project setup, routing, auth integration, GraphQL client, theme system, responsive layout
- `web-feature-screens`: All feature screens for web matching mobile functionality — feed, calendar, tree, chores, family management, notifications

### Modified Capabilities

_(None — the web app is additive. No mobile or backend specs change.)_

## Impact

- **New package**: `packages/web/` with Vite, React, urql, react-router
- **Modified files**: Root `package.json` (new `dev:web` script, web added to `concurrently`), `turbo.json` (add web package tasks), `.github/workflows/ci.yml` (add web lint/typecheck/test gates)
- **Dependencies**: `vite`, `react`, `react-dom`, `react-router`, `urql`, `graphql`, `@urql/exchange-auth`
- **Shared code**: Types, validation schemas, and mock data from `@family-app/shared`. UI components are NOT shared (mobile = React Native, web = React DOM) but screen logic patterns are the same.
- **Prerequisite**: Can start with mock data immediately. Real API integration requires Change `backend-api-wiring` to be complete.
