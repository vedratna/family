## 1. Project Scaffold

- [x] 1.1 Create `packages/web/` with Vite + React + TypeScript (`npm create vite`)
- [x] 1.2 Add `@family-app/shared` as workspace dependency
- [x] 1.3 Install dependencies: `react-router`, `tailwindcss`, `@tailwindcss/vite`
- [x] 1.4 Configure Tailwind with family-app design tokens (colors, spacing, typography as CSS variables)
- [x] 1.5 Add scripts to `package.json`: build, dev, lint, typecheck, test
- [x] 1.6 Add `dev:web` to root `package.json` and update `dev` concurrently command
- [x] 1.7 Configure vitest for the web package with React Testing Library
- [x] 1.8 Verify: `npm run dev:web` starts and renders a hello page in browser

## 2. Shell & Navigation

- [x] 2.1 Create app layout with sidebar (desktop) and bottom tab bar (mobile) using Tailwind responsive classes
- [x] 2.2 Set up react-router with routes: /feed, /calendar, /calendar/month, /calendar/:eventId, /tree, /tree/:personId, /chores, /settings, /settings/members
- [x] 2.3 Create navigation component with tabs: Feed, Calendar, Tree, Chores, Settings
- [x] 2.4 Create AppHeader component with family name, family switcher, and notification bell

## 3. Mock Data & Providers

- [x] 3.1 Create MockDataProvider (copy mock data from mobile package or import from shared)
- [x] 3.2 Create FamilyProvider with activeFamilyId, switchFamily, activeThemeName
- [x] 3.3 Create ThemeProvider that applies CSS variables based on active theme
- [x] 3.4 Wire providers into App.tsx: MockDataProvider → FamilyProvider → ThemeProvider → Router

## 4. Feature Pages

- [x] 4.1 Create FeedPage — list of posts with author, text, time ago, reactions, comments count + event cards
- [x] 4.2 Create PostDetailPage — post content + comments list (at /feed/:postId)
- [x] 4.3 Create CalendarPage — agenda view with events grouped by date
- [x] 4.4 Create CalendarMonthPage — month grid with event markers
- [x] 4.5 Create EventDetailPage — full event info with RSVPs (at /calendar/:eventId)
- [x] 4.6 Create FamilyTreePage — tree nodes by generation with spouse connections
- [x] 4.7 Create PersonRelationshipsPage — person's relationships list (at /tree/:personId)
- [x] 4.8 Create ChoresPage — chore list with status, assignee, due date
- [x] 4.9 Create SettingsPage — menu linking to members, theme picker, notifications, family switcher
- [x] 4.10 Create MembersPage — family members list with roles

## 5. Data Transformations

- [x] 5.1 Create feed data transformer (mock data → FeedItem[] with computed fields)
- [x] 5.2 Create calendar data transformer (mock data → grouped agenda sections + month grid)
- [x] 5.3 Create tree data transformer (mock family tree → renderable nodes)
- [x] 5.4 Create chores/members/settings transformers

## 6. Tests

- [x] 6.1 Write component tests for navigation (sidebar renders, tabs clickable, routes work)
- [x] 6.2 Write component tests for FeedPage (renders posts, handles click to detail)
- [x] 6.3 Write component tests for CalendarPage (renders events, agenda/month toggle)
- [x] 6.4 Write component tests for TreePage (renders nodes)
- [x] 6.5 Write component tests for ChoresPage and SettingsPage
- [x] 6.6 Write unit tests for data transformers
- [x] 6.7 Verify 95%+ coverage on new code

## 7. CI & Verification

- [x] 7.1 Add web package to turbo pipeline (lint, typecheck, test tasks)
- [x] 7.2 Verify full CI passes: lint, typecheck, test across all packages
- [x] 7.3 Verify `npm run dev:web` renders all pages with mock data in browser
