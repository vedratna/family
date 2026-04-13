## Context

The family-app backend is fully wired — 42 use cases, 11 DynamoDB repos, 9 Lambda handlers, AppSync GraphQL API with 11 queries and 22 mutations. The mobile app has 24 screens with mock data. A web app was always planned as Phase 2, and it provides the fastest way to test the full stack end-to-end (no simulator/Expo Go friction — just a browser).

## Goals / Non-Goals

**Goals:**

- Browsable web app at `localhost:5173` with all features
- Mock data mode for immediate development without backend
- Real API mode connecting to deployed AppSync
- Same shared types from `@family-app/shared`
- Responsive layout (desktop + mobile browser)
- 95% test coverage on new code
- CI pipeline integration (lint, typecheck, test)

**Non-Goals:**

- Server-side rendering (SPA is sufficient for this app)
- Offline support / PWA (mobile app covers offline use)
- Pixel-perfect match with mobile screens (web has its own layout)
- Real Cognito auth integration (mock auth for now, real auth is a follow-up)

## Decisions

### 1. Vite + React (No Framework)

**Decision:** Use Vite with plain React + TypeScript. No Next.js, no Remix.

**Rationale:** The app is a SPA consumed by authenticated users. No SEO needed, no server-side rendering needed. Vite gives instant HMR, fast builds, and zero config. Adding Next.js would add complexity (routing conventions, API routes, SSR) with no benefit.

### 2. React Router for Navigation

**Decision:** Use `react-router` v7 for client-side routing.

```
/                   → Redirect to /feed
/login              → LoginPage
/feed               → FeedPage
/feed/:postId       → PostDetailPage (comments)
/calendar           → CalendarPage (agenda view)
/calendar/month     → CalendarMonthPage
/calendar/:eventId  → EventDetailPage
/tree               → FamilyTreePage
/tree/:personId     → PersonRelationshipsPage
/chores             → ChoresPage
/settings           → SettingsPage (members, theme, notifications)
/settings/members   → MembersPage
```

### 3. urql for GraphQL Client

**Decision:** Use `urql` (lightweight GraphQL client) instead of Apollo Client.

**Rationale:** urql is ~5x smaller than Apollo, has built-in exchange system for auth, and covers all our needs (queries, mutations, caching). No subscriptions needed. AppSync auth header added via a custom exchange.

### 4. Mock Data Provider Pattern (Same as Mobile)

**Decision:** Reuse the same mock data from `@family-app/shared` (or copy the mobile mock data). A `MockDataProvider` context provides data to all pages. Toggle via env var `VITE_MOCK_MODE=true`.

**Rationale:** Allows development without the backend running. Same pattern as mobile — consistency across platforms.

### 5. Tailwind CSS for Styling

**Decision:** Use Tailwind CSS for styling. Utility-first approach matches the rapid development pace.

**Rationale:** No component library dependency, highly customizable, small bundle with tree-shaking. The family-app already has a design token system (colors, spacing, typography) that maps directly to Tailwind config.

### 6. Theme System — Map Existing Tokens to CSS Variables

**Decision:** Map the existing theme tokens from `@family-app/shared` (8 accent palettes, light/dark modes) to CSS custom properties. Tailwind config references these variables.

```css
:root {
  --color-accent-primary: #2B8A7E;  /* teal */
  --color-bg-primary: #FAFAF8;
  ...
}
[data-theme="dark"] {
  --color-bg-primary: #1A1A1A;
  ...
}
```

## Risks / Trade-offs

**[Duplicate screen logic]** → Web and mobile screens implement the same features independently. Mitigate by sharing types, validation, and mock data via `@family-app/shared`. UI components can't be shared (React DOM vs React Native).

**[Mock → real API transition]** → Switching from mock to real API requires GraphQL queries matching the schema exactly. Mitigate by writing GraphQL operations early and testing them against the mock data shape.

**[Tailwind learning curve]** → If the team isn't familiar with Tailwind. Mitigate by using simple utility classes and referencing the Tailwind docs.
