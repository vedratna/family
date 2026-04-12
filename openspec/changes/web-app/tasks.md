## 1. Project Scaffold

- [ ] 1.1 Create `packages/web/` with Vite + React + TypeScript (`npm create vite`)
- [ ] 1.2 Add `@family-app/shared` as workspace dependency
- [ ] 1.3 Install dependencies: `react-router`, `tailwindcss`, `@tailwindcss/vite`
- [ ] 1.4 Configure Tailwind with family-app design tokens (colors, spacing, typography as CSS variables)
- [ ] 1.5 Add scripts to `package.json`: build, dev, lint, typecheck, test
- [ ] 1.6 Add `dev:web` to root `package.json` and update `dev` concurrently command
- [ ] 1.7 Configure vitest for the web package with React Testing Library
- [ ] 1.8 Verify: `npm run dev:web` starts and renders a hello page in browser

## 2. Shell & Navigation

- [ ] 2.1 Create app layout with sidebar (desktop) and bottom tab bar (mobile) using Tailwind responsive classes
- [ ] 2.2 Set up react-router with routes: /feed, /calendar, /calendar/month, /calendar/:eventId, /tree, /tree/:personId, /chores, /settings, /settings/members
- [ ] 2.3 Create navigation component with tabs: Feed, Calendar, Tree, Chores, Settings
- [ ] 2.4 Create AppHeader component with family name, family switcher, and notification bell

## 3. Mock Data & Providers

- [ ] 3.1 Create MockDataProvider (copy mock data from mobile package or import from shared)
- [ ] 3.2 Create FamilyProvider with activeFamilyId, switchFamily, activeThemeName
- [ ] 3.3 Create ThemeProvider that applies CSS variables based on active theme
- [ ] 3.4 Wire providers into App.tsx: MockDataProvider → FamilyProvider → ThemeProvider → Router

## 4. Feature Pages

- [ ] 4.1 Create FeedPage — list of posts with author, text, time ago, reactions, comments count + event cards
- [ ] 4.2 Create PostDetailPage — post content + comments list (at /feed/:postId)
- [ ] 4.3 Create CalendarPage — agenda view with events grouped by date
- [ ] 4.4 Create CalendarMonthPage — month grid with event markers
- [ ] 4.5 Create EventDetailPage — full event info with RSVPs (at /calendar/:eventId)
- [ ] 4.6 Create FamilyTreePage — tree nodes by generation with spouse connections
- [ ] 4.7 Create PersonRelationshipsPage — person's relationships list (at /tree/:personId)
- [ ] 4.8 Create ChoresPage — chore list with status, assignee, due date
- [ ] 4.9 Create SettingsPage — menu linking to members, theme picker, notifications, family switcher
- [ ] 4.10 Create MembersPage — family members list with roles

## 5. Data Transformations

- [ ] 5.1 Create feed data transformer (mock data → FeedItem[] with computed fields)
- [ ] 5.2 Create calendar data transformer (mock data → grouped agenda sections + month grid)
- [ ] 5.3 Create tree data transformer (mock family tree → renderable nodes)
- [ ] 5.4 Create chores/members/settings transformers

## 6. Tests

- [ ] 6.1 Write component tests for navigation (sidebar renders, tabs clickable, routes work)
- [ ] 6.2 Write component tests for FeedPage (renders posts, handles click to detail)
- [ ] 6.3 Write component tests for CalendarPage (renders events, agenda/month toggle)
- [ ] 6.4 Write component tests for TreePage (renders nodes)
- [ ] 6.5 Write component tests for ChoresPage and SettingsPage
- [ ] 6.6 Write unit tests for data transformers
- [ ] 6.7 Verify 95%+ coverage on new code

## 7. CI & Verification

- [ ] 7.1 Add web package to turbo pipeline (lint, typecheck, test tasks)
- [ ] 7.2 Verify full CI passes: lint, typecheck, test across all packages
- [ ] 7.3 Verify `npm run dev:web` renders all pages with mock data in browser
