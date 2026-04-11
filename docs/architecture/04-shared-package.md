# Shared Package

> Last reviewed: 2026-04-07

The `packages/shared/` package is the single source of truth for types, validation schemas, and constants used by both backend and mobile. It ensures zero drift between what the frontend expects and what the backend enforces.

## Package Structure

```
packages/shared/src/
├── types/           ← Domain type definitions
│   ├── user.ts      ← User, AuthTokens, UserProfile
│   ├── family.ts    ← Family, Person, FamilyMembership, Invitation
│   ├── relationship.ts ← Relationship, RelationshipType, RelationshipStatus
│   ├── post.ts      ← Post, PostMedia, Comment, Reaction
│   ├── event.ts     ← FamilyEvent, EventRSVP, EventType, RSVPStatus
│   ├── chore.ts     ← Chore, ChoreStatus
│   ├── notification.ts ← NotificationPreference, DeviceToken
│   ├── media.ts     ← Media, MediaType, ALLOWED_MEDIA_TYPES
│   ├── roles.ts     ← Role, ROLES
│   ├── theme.ts     ← ThemeName, THEME_NAMES
│   └── index.ts     ← Re-exports everything
│
├── validation/      ← Zod schemas for API input validation
│   ├── family.ts    ← CreateFamilyInput, InviteMemberInput, UpdateMemberRoleInput, UpdateFamilyThemeInput
│   ├── post.ts      ← CreatePostInput, AddCommentInput, AddReactionInput
│   ├── event.ts     ← CreateEventInput, EditEventInput, RSVPInput
│   ├── relationship.ts ← CreateRelationshipInput, EditRelationshipInput
│   ├── chore.ts     ← CreateChoreInput, CompleteChoreInput
│   ├── media.ts     ← RequestUploadInput
│   └── index.ts     ← Re-exports everything
│
├── constants/       ← Re-exports const arrays from types for convenience
│   └── index.ts     ← ROLES, THEME_NAMES, RELATIONSHIP_TYPES, EVENT_TYPES, etc.
│
└── index.ts         ← Root entry: exports types/, validation/, constants/
```

## Domain Type Map

```
User ──────┐
           │ userId
           ▼
FamilyMembership ──── Family
  │ personId            │ familyId
  ▼                     ▼
Person ◄──── Relationship (bi-directional)
  │                     │
  ├──── Post            ├──── FamilyEvent
  │     │ postId        │     │ eventId
  │     ├── Comment     │     └── EventRSVP
  │     ├── Reaction    │
  │     └── PostMedia   ├──── Chore
  │                     │
  └──── Invitation      └──── TreeCache

User ──── NotificationPreference (per family, per category)
  │
  └──── DeviceToken (per device)
```

## Validation (Zod) — Shared Between Frontend and Backend

Every API input has a Zod schema defined once in `shared/validation/`. Both the mobile client and Lambda handlers validate against the same schema.

```
┌──────────────────────────────────────────────┐
│  packages/shared/src/validation/family.ts    │
│                                              │
│  CreateFamilyInput = z.object({              │
│    name: z.string().min(1).max(100),         │
│    themeName: z.enum(THEME_NAMES)            │
│  })                                          │
└──────────────┬──────────────┬────────────────┘
               │              │
       ┌───────▼──────┐ ┌────▼───────────┐
       │   Mobile     │ │   Lambda       │
       │   validates  │ │   validates    │
       │   on submit  │ │   on entry     │
       └──────────────┘ └────────────────┘
       Instant feedback   Security boundary
```

## How Packages Consume Shared

**Backend** — imports types for use case signatures and repository interfaces:

```typescript
import type { User, UserProfile } from "@family-app/shared";
```

**Mobile** — imports types for API response typing and Zod schemas for form validation:

```typescript
import { CreateFamilyInput, type ThemeName } from "@family-app/shared";
```

Both resolve `@family-app/shared` via npm workspaces — no build step needed for development.
