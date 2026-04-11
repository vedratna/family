## Context

This is a greenfield project — no existing codebase, infrastructure, or users. The goal is to build a privacy-first family app that combines social sharing, event coordination, relationship mapping, and household management into a single platform.

The target audience is extended families (potentially 50+ members spanning multiple generations). The app must be usable by both tech-savvy younger members and less technical older family members. One user may belong to multiple family groups.

Key constraints:
- AWS serverless backend (cost-efficient at low scale, scales with growth)
- React Native (Expo) for mobile-first delivery on iOS and Android
- Privacy-first: no ads, no data selling, no third-party tracking
- Must support members who exist in the family tree but don't have the app installed
- Full-stack TypeScript — one language across mobile, backend, infra, and shared packages
- World-class code quality enforced from commit one via tooling, not discipline

## Goals / Non-Goals

**Goals:**
- Deliver a Phase 1 mobile app with: auth, family management, member relationships, social feed, calendar, and push notifications
- Design a backend API that can serve both mobile and a future React web app
- Auto-generate family trees from relationship data without manual tree building
- Support bi-directional relationship labels with automatic inference
- Provide role-based access control (Owner/Admin/Editor/Viewer)
- Keep operational costs near-zero for small families, scaling with usage
- Enforce code quality, maintainability, and best design patterns from the first commit
- Achieve high test coverage with automated quality gates blocking all merges

**Non-Goals:**
- React web app (Phase 2 — not in this change)
- Chore management (Phase 3)
- Direct social media API integrations for cross-posting (v1 uses native share sheet)
- Feature-level granular permissions (v1 uses simple roles; data model supports future granularity)
- Genealogy/historical research features
- Chat/messaging (families already have WhatsApp for this)
- Video calling

## Decisions

### 1. Database: DynamoDB (Single-Table Design)

**Decision:** Use DynamoDB with a single-table design and on-demand (pay-per-request) billing.

**Rationale:** Cost is the critical factor. DynamoDB on-demand pricing means near-zero cost at low scale — a small family app could run for pennies/month. Aurora Serverless v2 has a ~$50/mo minimum which is prohibitive for an early-stage app with no revenue.

**Single-table design:** All entities (users, families, persons, relationships, posts, events, chores) share one table with composite keys (PK/SK) and GSIs for access patterns:

- **PK: `FAMILY#<id>`**, SK: `MEMBER#<id>` — get all members of a family
- **PK: `FAMILY#<id>`**, SK: `POST#<timestamp>#<id>` — feed in time order
- **PK: `FAMILY#<id>`**, SK: `EVENT#<date>#<id>` — events by date range
- **PK: `FAMILY#<id>`**, SK: `REL#<personA>#<personB>` — relationships
- **PK: `USER#<id>`**, SK: `FAMILY#<id>` — all families for a user (family switcher)
- **GSI1**: For reverse lookups (e.g., all relationships for a person)

**Relationship queries:** The family tree and relationship inference require multi-hop traversals. Since families are bounded in size (typically <200 members), the approach is:
1. Fetch ALL relationships for a family in a single query (PK: `FAMILY#<id>`, SK begins_with `REL#`)
2. Build the graph in the Lambda function (application-level traversal)
3. Cache the computed tree in a dedicated item (`PK: FAMILY#<id>`, `SK: TREE_CACHE`) and invalidate on relationship changes

This is viable because family graphs are small. A family of 200 people might have ~400 relationships — easily fits in a single DynamoDB response and can be traversed in-memory in milliseconds.

**Alternatives considered:**
- *Aurora Serverless v2 (PostgreSQL)*: Recursive CTEs and JOINs handle relationship queries naturally. But minimum ~$50/mo cost is too high for early stage. Can migrate later if revenue supports it.
- *Neptune (graph DB)*: Purpose-built for graph queries. Overkill and expensive for this use case.

### 2. API: GraphQL (AppSync) over REST

**Decision:** Use AWS AppSync (managed GraphQL) for the API layer.

**Rationale:** The mobile app has varied data needs — the feed screen needs posts with author info and recent comments; the tree screen needs all relationships; the calendar needs events in a date range. GraphQL lets the client fetch exactly what it needs in one request, reducing round-trips on mobile networks. AppSync also provides built-in real-time subscriptions for live feed updates.

**Alternatives considered:**
- *REST via API Gateway + Lambda*: Simpler to build initially. But would require multiple endpoints and over-fetching or under-fetching on mobile. Rejected for mobile efficiency reasons.
- *Self-hosted GraphQL (Apollo)*: More control but requires managing servers. AppSync is managed and integrates well with Cognito and Lambda.

### 3. Auth: AWS Cognito

**Decision:** Use Cognito User Pools for authentication with phone number as primary identifier.

**Rationale:** Phone number is the most universal identifier in family contexts (especially in India where email usage varies by generation). Cognito handles OTP verification, token management, and multi-device sessions out of the box.

Social login (Google/Apple) will be supported as secondary options.

### 4. Media: S3 with presigned URLs

**Decision:** Upload media directly from the client to S3 using presigned URLs. Store metadata in the database.

**Rationale:** Avoids routing large files through Lambda (which has payload limits). The flow: client requests a presigned upload URL → uploads directly to S3 → notifies backend with the S3 key → backend stores metadata. For retrieval, CloudFront serves media via presigned URLs.

### 5. Notifications: SNS + EventBridge

**Decision:** Use SNS for push notification delivery and EventBridge for scheduling future reminders.

**Rationale:** When an event is created (e.g., "Grandma's Birthday, April 12"), EventBridge rules are created for reminder times (7 days before, 1 day before, day-of). Each rule triggers a Lambda that checks member notification preferences and sends via SNS to opted-in devices.

### 6. Infrastructure as Code: AWS CDK (TypeScript)

**Decision:** Use AWS CDK in TypeScript for all infrastructure.

**Rationale:** TypeScript CDK allows sharing types between infrastructure and Lambda code. The team is already using TypeScript for the React Native app, so one language across the stack reduces context switching.

### 7. Relationship Inference Engine

**Decision:** Implement relationship inference as a background Lambda triggered on relationship changes.

**Rationale:** When a new relationship is added (e.g., "Rajesh is Grandma's son"), a Lambda evaluates existing relationships to suggest new ones (e.g., "Rajesh's wife Priya is Grandma's daughter-in-law"). Suggestions are stored as "pending" relationships that an admin can confirm with one tap.

Inference rules:
- Parent + Spouse → In-law
- Parent's Parent → Grandparent
- Parent's Sibling → Uncle/Aunt
- Parent's Sibling's Child → Cousin
- Sibling's Spouse → Sibling-in-law

### 8. Multi-Family Data Isolation

**Decision:** All queries are scoped to a family_id. No cross-family data leakage.

**Rationale:** A user in multiple families sees completely separate feeds, calendars, trees, and member lists for each family. In DynamoDB, this is enforced by the partition key design — all family data lives under `FAMILY#<id>` partition keys. Lambda resolvers verify family membership before executing any query.

### 9. Full-Stack TypeScript Monorepo with Turborepo

**Decision:** Use TypeScript across the entire stack (mobile, backend, infra, shared) in a Turborepo monorepo.

**Rationale:** One language eliminates context switching and enables sharing types, validation schemas, and constants between frontend and backend. Turborepo provides build caching and parallel task execution across packages. The monorepo structure:

```
packages/
├── shared/          ← Types, Zod validation schemas, constants (used by all)
├── backend/         ← Lambda handlers, use cases, repositories
├── mobile/          ← React Native (Expo) app
└── infra/           ← AWS CDK stacks
```

Key benefit: Input validation schemas (Zod) are defined once in `shared/` and used on both client (instant feedback) and server (security). No drift between what frontend expects and backend enforces.

**Alternatives considered:**
- *Python backend*: Pydantic is excellent for validation, but forces duplicate type definitions across two languages, double the tooling config (ESLint + Ruff, Jest + Pytest, npm + pip), and prevents code sharing. Rejected for maintainability.
- *Nx*: More features than Turborepo but heavier and more opinionated. Turborepo is simpler and sufficient.
- *Plain npm workspaces*: No build caching or task orchestration. Turborepo adds this with minimal config.

### 10. Clean / Hexagonal Architecture (Backend)

**Decision:** Structure the backend using clean architecture with strict layer boundaries: Handlers → Use Cases → Repositories → Domain Models.

**Rationale:** Separating business logic from infrastructure (DynamoDB, AppSync, SNS) makes the codebase testable, maintainable, and portable. Use cases can be unit-tested with mocked repositories — no AWS needed. If we later migrate from DynamoDB to PostgreSQL, only the repository implementations change; business logic is untouched.

Layer rules (enforced by `eslint-plugin-boundaries`):
- **Domain models**: Pure TypeScript types/interfaces. No imports from any other layer. No framework dependencies.
- **Use cases**: Business logic. Depend only on domain models and repository interfaces. No AWS SDK imports.
- **Repositories**: Data access. Implement repository interfaces. DynamoDB-specific code lives only here.
- **Handlers**: Lambda entry points. Thin (5-10 lines). Parse input, call use case, format response.
- **Shared**: Cross-cutting concerns — middleware (auth, logging, error handling), Zod validation schemas.

```
Handler (thin)
  → validates input (Zod)
  → calls use case
  → returns formatted response

Use Case (business logic)
  → receives repository interfaces via dependency injection
  → orchestrates domain operations
  → returns domain types or typed errors

Repository (data access)
  → implements interface from use-cases layer
  → translates domain types ↔ DynamoDB items
  → handles PK/SK construction, GSI queries
```

**Patterns applied:**
- **Repository Pattern** — abstracts data access behind interfaces
- **Dependency Injection** — use cases receive repositories, not instantiate them
- **Domain Error Types** — typed errors (NotFoundError, PermissionDeniedError, ValidationError) instead of generic Error throws
- **Result Pattern** (optional) — consider `Result<T, E>` return types for explicit error handling

### 11. Feature-Based Frontend Architecture

**Decision:** Structure the React Native app by feature modules, with custom hooks as view models.

**Rationale:** Feature-based organization keeps related code together (screens, hooks, components, API queries for "feed" all live in `features/feed/`). Custom hooks act as view models — screens are pure UI with no business logic or API calls. This makes screens easy to test and reason about.

```
features/
├── auth/          ← screens/, hooks/, components/, api/
├── feed/
├── calendar/
├── tree/
├── family/
└── chores/

shared/
├── components/    ← Reusable UI (Button, Avatar, Card, EmptyState)
├── hooks/         ← Shared hooks
├── theme/         ← Design tokens (colors, spacing, typography)
├── navigation/    ← Route definitions
└── utils/

providers/
├── AuthProvider.tsx
├── FamilyProvider.tsx    ← Active family context
└── QueryProvider.tsx     ← TanStack Query config
```

**Key patterns:**
- **TanStack Query** for server state — caching, deduplication, background refresh, stale-while-revalidate
- **Presentational/Container split** — shared components are pure UI, feature components wire data
- **Design tokens** — centralized theme, no hardcoded colors/spacing

### 12. Static Analysis & Quality Toolchain

**Decision:** Enforce code quality through automated tooling from the first commit. No code merges without passing all quality gates.

**Toolchain:**

| Tool | Purpose | Scope |
|------|---------|-------|
| TypeScript (strict mode) | Type safety, null checks, exhaustive switches | All packages |
| ESLint | Code patterns, no-any, no-floating-promises, import order | All TS/TSX files |
| eslint-plugin-boundaries | Architecture layer enforcement (prevent screens importing DynamoDB) | Backend + Mobile |
| Prettier | Consistent formatting | All files |
| Zod | Runtime input validation at API boundaries | Shared package |
| Husky + lint-staged | Pre-commit gate (lint + format on staged files) | Git hooks |
| commitlint | Conventional commit messages | Git hooks |

**TypeScript strict config (non-negotiable):**
- `strict: true` — enables all strict checks
- `noUncheckedIndexedAccess: true` — forces handling undefined from array/object access (critical for DynamoDB results)
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`
- `forceConsistentCasingInFileNames: true`

**ESLint rules beyond defaults:**
- `@typescript-eslint/no-explicit-any` — no `any` types, ever
- `@typescript-eslint/no-floating-promises` — every Promise must be awaited or handled
- `@typescript-eslint/strict-boolean-expressions` — no truthy/falsy shortcuts on non-booleans
- `@typescript-eslint/no-unused-vars` (error) — no dead variables, imports, or parameters. Dead code is not commented out — it is deleted.
- `@typescript-eslint/no-unnecessary-condition` — catches defensive checks against conditions that are always true/false based on types (e.g., null-checking a value TypeScript already guarantees is non-null)
- `@typescript-eslint/no-redundant-type-constituents` — catches redundant type unions (e.g., `string | never`)
- `@typescript-eslint/no-useless-constructor` — no empty or pass-through constructors
- `no-else-return` — no `else` after a `return`; reduces nesting
- `no-unreachable` — catches code after return/throw/break
- `import/no-cycle` — prevents circular dependencies
- `boundaries/element-types` — enforces architecture layers via lint rules

**No defensive code / no dead code policy:**

Trust the type system and framework guarantees. Do not write defensive code for scenarios that TypeScript's type checker already prevents. Examples of what is NOT allowed:
- Null-checking a value that the type system guarantees is non-null
- Try/catch around code that cannot throw based on its contract
- `if (typeof x === 'string')` when `x` is already typed as `string`
- Fallback default values for required parameters
- Commented-out code blocks — if code is removed, it is deleted, not commented. Git history preserves it.
- Unused imports, variables, functions, or parameters — delete them, don't prefix with `_`
- Empty catch blocks that swallow errors silently
- Redundant `else` blocks after early returns

The principle: **fail fast, fail loud**. If something unexpected happens, throw a typed domain error — don't silently handle it with a fallback. Validate at system boundaries (API input via Zod), trust internal code after that.

### 13. Testing Strategy

**Decision:** Follow the testing pyramid with 80% minimum line coverage enforced in CI. 100% coverage required on use-cases/.

**Testing layers:**
- **Unit tests (75%)** — Use cases with mocked repositories, domain models, relationship inference engine, React hooks (`@testing-library/react-hooks`), components (React Native Testing Library)
- **Integration tests (20%)** — Lambda handlers with DynamoDB Local (real DynamoDB operations), API resolver tests with real data, permission enforcement tests across all operations
- **E2E tests (5%)** — Detox for critical user flows: register → create family → add member → create post; login → switch family → view feed

**Testing tools:**
- **Vitest** — fast, TypeScript-native test runner (preferred over Jest for speed)
- **DynamoDB Local** — runs in Docker for integration tests, no AWS account needed
- **React Native Testing Library** — component tests focused on user behavior, not implementation
- **Detox** — E2E mobile testing
- **MSW (Mock Service Worker)** — mock GraphQL responses in frontend tests

### 14. CI/CD Pipeline & Quality Gates

**Decision:** GitHub Actions CI pipeline with 7 parallel/sequential checks. All must pass before PR is mergeable.

**Pipeline:**
1. **Lint & Format Check** — ESLint + Prettier (fail-fast)
2. **Type Check** — `tsc --noEmit` across all packages
3. **Unit Tests** — Vitest with coverage report
4. **Integration Tests** — DynamoDB Local in Docker
5. **Build Check** — Backend bundles + Mobile builds
6. **Bundle Size Check** — Fail if mobile bundle exceeds threshold
7. **Security Audit** — `npm audit` + dependency vulnerability check

Steps 1-3 run in parallel for speed. No merging until all 7 pass.

**Pre-commit hooks (local, via Husky + lint-staged):**
- On commit: ESLint on staged .ts/.tsx files, Prettier on staged files, commitlint on commit message
- On push: Type check (`tsc --noEmit`)

### 15. Backend Performance Patterns

**Decision:** Apply Lambda and DynamoDB best practices for cold start optimization and efficient data access.

**Lambda:**
- **esbuild bundling** — tree-shaken, small bundles for faster cold starts
- **Connection reuse** — initialize DynamoDB client outside handler (reused across warm invocations)
- **Minimal dependencies** — keep Lambda packages lean; shared code via Lambda layers
- **Provisioned concurrency** — not needed at launch, available if latency becomes critical

**DynamoDB:**
- **ProjectionExpression** — fetch only needed attributes, reduce read capacity consumption
- **BatchGetItem / BatchWriteItem** — batch operations where possible
- **Tree cache** — computed family tree cached as a DynamoDB item, invalidated on relationship changes
- **Pagination** — cursor-based pagination for feed and comments using DynamoDB's `ExclusiveStartKey`

**Frontend:**
- **TanStack Query** — automatic caching, background refetch, stale-while-revalidate
- **FlatList virtualization** — only render visible items in feed and member lists
- **Image optimization** — lazy loading, progressive loading, cached thumbnails
- **Memoization** — `React.memo`, `useMemo`, `useCallback` guided by profiling (not blindly applied everywhere)
- **Lazy screen loading** — feature screens loaded on demand, not at app startup

### 16. Theming System — Per-Family Accent Color with Dark Mode

**Decision:** Implement a theming system where each family selects an accent color from 8 predefined themes, with automatic light/dark mode support. Default theme: Warm Teal.

**Color architecture:** Only the accent color changes per theme. Backgrounds, text, spacing, typography, semantic colors (red/amber/green) are constant across all themes. This ensures consistency, accessibility, and maintainability.

**Base palette (constant across all themes):**
- Light mode backgrounds: Warm White (#FAFAF8), Warm Gray (#F4F3F0 cards, #EDECEA secondary)
- Dark mode backgrounds: Warm Dark (#1A1A1A), Elevated (#242422, #2E2E2C). Never pure black.
- Light mode text: #1A1A1A (primary), #6B6966 (secondary), #9C9894 (tertiary)
- Dark mode text: #F0EFED (primary), #A8A5A0 (secondary), #7A7672 (tertiary)
- Semantic: Soft Red #D4483B (errors), Warm Amber #E8913A (warnings), Muted Green #4A9E6B (success)

**8 accent themes:**

| Theme | Primary | Dark | Light Tint | Dark Mode Adjusted |
|-------|---------|------|------------|-------------------|
| Teal (default) | #2B8A7E | #237069 | #E6F4F2 | #3DBCAD |
| Indigo | #5B5FC7 | #4A4EB5 | #EDEDFA | #7B7FE0 |
| Coral | #C96B5B | #B35A4A | #FAEAE7 | #E0857A |
| Sage | #6B8F71 | #5A7A5F | #E8F0E9 | #8AB891 |
| Amber | #B8860B | #9A7209 | #F5EDD6 | #D4A830 |
| Ocean | #3A7CA5 | #2E6384 | #E3EFF5 | #5A9DC5 |
| Plum | #8B5E83 | #744D6D | #F2E8F0 | #A87DA0 |
| Slate | #64748B | #4F5D73 | #E8ECF0 | #8494A7 |

**Dark mode strategy:**
- Follows device system setting by default
- Manual override in app settings: Light / Dark / System (per-user, not per-family)
- Accent colors brighten slightly in dark mode for contrast
- Shadows replaced by subtle borders in dark mode
- Warm dark (#1A1A1A) not pure black — softer on eyes at night

**Theme token structure:**
```
shared/theme/
├── colors/
│   ├── base.ts          ← Neutral backgrounds, text, semantic (same for all themes)
│   ├── themes.ts        ← 8 accent palettes
│   └── dark-mode.ts     ← Dark variants of base + accent brightening
├── typography.ts        ← System font, sizes (16px base min), line height 1.5x
├── spacing.ts           ← 8px grid: xs(4), sm(8), md(16), lg(24), xl(32), xxl(48)
├── radius.ts            ← sm(8), md(12), lg(16), xl(24), full(9999)
├── shadows.ts           ← Subtle elevation (light mode only)
└── index.ts             ← useTheme() hook resolving active family theme + dark mode
```

**Cross-generational accessibility (non-negotiable):**
- Typography: 16px base minimum, 13px absolute minimum for captions. System font (San Francisco / Roboto).
- Contrast: WCAG AAA (7:1) for all essential text. AA (4.5:1) minimum for accent-on-white.
- Touch targets: 48x48px minimum (Apple HIG). List items 56px minimum height.
- Dynamic Type: respect device font size settings, test at 1x, 1.5x, and 2x text scale.
- 8px grid system for all spacing — breathable, never cramped.

### 17. Illustration Strategy — Open Peeps + unDraw

**Decision:** Use Open Peeps for people-focused illustrations and unDraw for feature/situation illustrations. All illustrations tinted with the active family's accent color.

**Open Peeps (people-focused):**
- Welcome/onboarding screens
- Empty family members list
- Invitation sent/pending states
- Default avatars (before photo upload)
- Family tree placeholder nodes

**unDraw (feature/situation-focused):**
- Empty feed ("Share your first moment")
- Empty calendar ("No events yet")
- Empty chores ("All caught up!")
- No notifications state
- Error and offline states

**Style guidelines:**
- Loose, hand-drawn line art. Warm, slightly imperfect strokes.
- Muted fills using the current family's theme accent color — same illustration feels different per family.
- Diverse family representations, multigenerational scenes.
- Not childish/cartoonish, not flat corporate vector art.

### 18. Onboarding Flow

**Decision:** Two distinct onboarding paths — one for the family definer (creator) and one for invitees joining via link.

**Definer flow (5 screens):**
1. Welcome — hero illustration (Open Peeps), sign-up options (phone, Google, Apple)
2. Phone verification — OTP entry, auto-advance on complete
3. Profile setup — name, optional photo (Open Peeps default avatar), optional DOB ("helps us remind your family!")
4. Create family — family name, theme color picker with live preview
5. Invite members — pre-populated space for 2 invites (name, phone, relationship). "Add another" expandable. "I'll do this later" de-emphasized.

**Invitee flow (3 screens):**
1. Invitation landing — shows who invited them, which family, pre-filled relationship. One "Join Family" CTA.
2. Phone verification + profile — minimal: name (pre-filled), photo
3. Mini-tour overlay — 3 steps: Feed, Calendar+Tree, Notifications. Skippable at any step. Does not repeat.

**Key UX decisions:**
- Definer gets NO tour (they explored during setup)
- Invitee gets a 3-step mini-tour (they land in an unfamiliar app)
- DOB nudge tied to feature value ("helps us remind your family!")
- Theme color picker has live preview — delightful, not administrative
- Invite screen pre-populates 2 slots (not empty, not overwhelming)

### 19. Activation Gate — Posting Blocked Until Family Has 2+ Members

**Decision:** The family definer cannot create posts or comments until at least one other member (with an app account) has joined the family. This prevents posting into the void and forces the social loop to complete before content begins.

**Locked state (single-member family):**
- CAN: invite members, add non-app persons, create calendar events, explore tree, define relationships
- CANNOT: create posts, add comments

**Locked feed shows:**
- System-generated welcome post (always present, not deletable)
- "Waiting for your family to join" illustration (Open Peeps) with invite status for pending members
- "While you wait" suggestions: add a family event, add family members to the tree
- Prominent "Invite More Family" CTA

**Unlocked state:** activated when first non-creator member joins.

**Persistent "Invite Family" header button:** displayed until at least 2 members with app accounts have joined. Visible to all members.

**Re-engagement notification cadence (if no member joins):**
- +24 hours: "Your [Family] is waiting! [Names] haven't joined yet. Tap to resend invites."
- +1 week: "[Family] misses you! Your family space is ready — just needs your family!"
- +1 month: "Still want to connect your family? [Family] is waiting for its first member."
- After 1 month: STOP. Respect the user's silence.
- All re-engagement stops immediately once the first member joins.

**Setup checklist (definer only):**
Dismissable card on the feed showing progress: Create family (auto-checked), Invite members, Add a family event, Share your first post, Complete your family tree.

## Risks / Trade-offs

**[DynamoDB relationship query complexity]** → Multi-hop relationship traversals (find all cousins, build tree) must be done in application code rather than with SQL JOINs/CTEs. Mitigate by fetching all relationships for a family in one query and traversing in-memory — viable because family graphs are small (<200 members). Cache computed trees and invalidate on changes.

**[DynamoDB single-table learning curve]** → Single-table design requires upfront access pattern planning and is harder to evolve. Mitigate by documenting all access patterns, using GSIs for flexibility, and keeping the key schema well-documented.

**[AppSync learning curve]** → Team may be more familiar with REST. Mitigate by starting with simple queries/mutations and adding complexity incrementally. AppSync's auto-generated resolvers reduce boilerplate.

**[Relationship inference correctness]** → Family structures can be complex (remarriage, adoption, blended families). Inference may suggest incorrect relationships. Mitigate by always requiring admin confirmation for inferred relationships — never auto-accept.

**[Push notification deliverability]** → iOS and Android have different notification behaviors and restrictions. Mitigate by using Expo's push notification service which abstracts platform differences.

**[Media storage costs at scale]** → A very active family uploading videos frequently could generate significant S3 costs. Mitigate by monitoring per-family usage and introducing limits/compression if needed (deferred decision per user's request).

**[Cross-generational UX]** → Older family members may struggle with app adoption. Mitigate by keeping the core UX simple (feed-first, minimal navigation) and supporting the share-out feature so non-app users still see content via WhatsApp.

## Open Questions

1. **Expo managed vs bare workflow?** Managed is simpler but limits native module access. Bare gives full control but more maintenance. Recommend starting managed, ejecting if needed.
2. **Push notification service**: Expo Push Notifications vs direct SNS integration? Expo's service simplifies token management across platforms.
3. **Image/video compression**: Client-side before upload, or server-side via Lambda/MediaConvert? Client-side is cheaper but less consistent.
4. **Offline support**: Should the feed work offline with local caching? Important for users in areas with spotty connectivity.
