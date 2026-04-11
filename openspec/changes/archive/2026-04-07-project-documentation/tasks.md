## 1. Architecture Documentation — Level 1 (Overview)

- [x] 1.1 Create `docs/architecture/` directory
- [x] 1.2 Write `00-overview.md`: system architecture diagram (mobile → AppSync → Lambda → DynamoDB/S3/SNS/EventBridge), tech stack summary, monorepo package structure, "where does X live?" quick-reference table

## 2. Architecture Documentation — Level 2 (Deep Dives)

- [x] 2.1 Write `01-backend.md`: clean architecture layer diagram, request lifecycle (AppSync → Handler → UseCase → Repo → DynamoDB), layer boundary rules table, dependency injection pattern, domain error types inventory, permission system (role hierarchy, requireRole)
- [x] 2.2 Write `02-frontend.md`: feature-based module structure diagram, hooks-as-view-models pattern, TanStack Query integration (caching, stale-while-revalidate), theming system (useTheme, accent palettes, dark mode, design tokens), navigation structure, component hierarchy
- [x] 2.3 Write `03-infrastructure.md`: CDK stack dependency diagram (Auth → Database → Storage → API → Notification → Scheduler), AWS service topology, stage-based configuration (dev/prod), deployment flow
- [x] 2.4 Write `04-shared-package.md`: type system overview (all domain types with relationships), Zod validation schemas (shared between frontend/backend), constants, consumption pattern from backend and mobile
- [x] 2.5 Write `05-data-model.md`: complete DynamoDB single-table key schema table (PK/SK/GSI1/GSI2 for all 15 entity types), full 22-access-pattern table with key conditions and index used, entity relationship diagram

## 3. Architecture Documentation — Level 3 (Critical Flows)

- [x] 3.1 Write `06-critical-flows.md`: sequence diagram for user registration + first family creation (Cognito OTP → user record → family + person + membership)
- [x] 3.2 Add sequence diagram: invite → SMS → accept → person + membership created → activation gate check → feed unlocked
- [x] 3.3 Add sequence diagram: post creation with media (request presigned URL → S3 upload → confirm metadata → post stored → feed updated)
- [x] 3.4 Add sequence diagram: relationship creation → inference engine (fetch all rels → build graph → apply rules → store pending suggestions → admin confirm/reject)
- [x] 3.5 Add sequence diagram: family tree build (fetch persons + rels → build graph → BFS generations → serialize → cache in DynamoDB → invalidate on change)
- [x] 3.6 Add sequence diagram: event creation → EventBridge rules (7d, 1d, day-of) → Lambda trigger → check preferences → SNS push notification
- [x] 3.7 Add sequence diagram: re-engagement notification cadence (family created → +24h check → +1w check → +1m check → stop; cancel all if member joins)

## 4. Quality Standards Specification

- [x] 4.1 Create `docs/quality-standards.md` with document structure and introduction
- [x] 4.2 Write TypeScript strict mode section: every compiler flag with explanation and example
- [x] 4.3 Write no-defensive-code section: each banned pattern with BAD/GOOD code examples (null-checking guaranteed non-null, try/catch non-throwing, typeof on typed values, fallback defaults, commented-out code, unused vars, empty catch, redundant else)
- [x] 4.4 Write no-dead-code section: rules, ESLint rules that enforce them, "git remembers" principle
- [x] 4.5 Write fail-fast-fail-loud section: typed domain errors, validate at boundaries (Zod), trust internal code
- [x] 4.6 Write testing standards section: pyramid (75/20/5), coverage thresholds (80%/100%), what to test at each level, test runner config, prohibited patterns
- [x] 4.7 Write ESLint rules inventory: complete table of all custom rules with name, description, and rationale
- [x] 4.8 Write CI/CD gates section: all 7 gates, run order, parallel vs sequential, merge requirement
- [x] 4.9 Write architecture pattern enforcement section: clean architecture layer rules, eslint-plugin-boundaries config, dependency direction diagram, import rules table
- [x] 4.10 Write commit and PR standards section: conventional commits format, branch naming, PR review checklist (copy-pasteable)
- [x] 4.11 Write Prettier and formatting section: config explanation, pre-commit hooks flow

## 5. User Guide — Level 1 (Quick Start)

- [x] 5.1 Create `docs/user-guide/` directory
- [x] 5.2 Write `00-quick-start.md`: visual onboarding flow diagram, step-by-step for create account → profile → create family → pick theme → invite members

## 6. User Guide — Level 2 (Feature Guides)

- [x] 6.1 Write `01-home-feed.md`: feed overview, creating posts (text/photo/video), reactions, comments, sharing externally, event cards in feed, activation gate explanation
- [x] 6.2 Write `02-family-calendar.md`: creating events with type selection, month vs agenda view, RSVP, recurring events, automatic reminders (7d/1d/day-of), custom reminder timing
- [x] 6.3 Write `03-family-tree.md`: auto-generation from relationships, adding relationships (bi-directional labels), inference suggestions (confirm/dismiss), tapping to view profiles, non-app members in tree
- [x] 6.4 Write `04-chores.md`: creating/assigning chores, completing, rotation setup, filtered views (by assignee, status)
- [x] 6.5 Write `05-settings.md`: theme color picker (8 options), dark mode toggle (light/dark/system), notification preferences (defaults and customization), member management, role changes, ownership transfer
- [x] 6.6 Write `06-multi-family.md`: multiple family membership, family switcher with color indicators, data isolation between families

## 7. User Guide — Level 3 (Detailed Walkthroughs)

- [x] 7.1 Add detailed definer onboarding walkthrough section to quick-start: screen-by-screen (welcome → phone → OTP → profile → create family → invite members → locked feed)
- [x] 7.2 Add detailed invitee onboarding walkthrough: screen-by-screen (SMS link → invitation landing → profile → mini-tour 3 steps → feed)
- [x] 7.3 Add roles and permissions matrix: table showing owner/admin/editor/viewer permissions across all features (post, comment, react, create event, manage members, change theme, transfer ownership, delete family)

## 8. Cross-References and Final Review

- [x] 8.1 Add cross-references from architecture docs to quality standards where relevant (e.g., layer rules → boundaries plugin)
- [x] 8.2 Add cross-references from quality standards to architecture docs for pattern examples
- [x] 8.3 Verify all ASCII diagrams render correctly in markdown preview
- [x] 8.4 Verify progressive disclosure works: each Level 1 doc is self-contained, Level 2 docs are independently readable
- [x] 8.5 Add "Last reviewed" date to each document header
