# Backend Architecture

> Last reviewed: 2026-04-07

This document describes the backend architecture for the family app. The backend lives in `packages/backend/` and follows Clean/Hexagonal Architecture principles to keep business logic isolated from infrastructure concerns.

See [00-overview.md](./00-overview.md) for system-level context.

---

## Table of Contents

1. [Clean Architecture Overview](#clean-architecture-overview)
2. [Request Lifecycle](#request-lifecycle)
3. [Layer Boundary Rules](#layer-boundary-rules)
4. [Dependency Injection Pattern](#dependency-injection-pattern)
5. [Domain Error Types](#domain-error-types)
6. [Permission System](#permission-system)
7. [Repository Interfaces](#repository-interfaces)
8. [DynamoDB Single-Table Design](#dynamodb-single-table-design)
9. [Validation at API Boundaries](#validation-at-api-boundaries)
10. [ESLint Boundary Enforcement](#eslint-boundary-enforcement)

---

## Clean Architecture Overview

The backend is organized into four concentric layers. Dependencies point inward only -- outer layers depend on inner layers, never the reverse.

```
+-------------------------------------------------------------------+
|                                                                   |
|   HANDLERS (Infrastructure - outermost)                           |
|   AWS Lambda entry points, AppSync event parsing,                 |
|   DomainError-to-GraphQL error mapping                            |
|                                                                   |
|   +-----------------------------------------------------------+   |
|   |                                                           |   |
|   |   USE CASES (Application)                                 |   |
|   |   Business workflows, orchestration logic,                |   |
|   |   permission checks, input validation                     |   |
|   |                                                           |   |
|   |   +---------------------------------------------------+   |   |
|   |   |                                                   |   |   |
|   |   |   REPOSITORY INTERFACES (Domain boundary)         |   |   |
|   |   |   Abstractions that use cases depend on           |   |   |
|   |   |   (e.g., IUserRepository, IFamilyRepository)      |   |   |
|   |   |                                                   |   |   |
|   |   |   +-------------------------------------------+   |   |   |
|   |   |   |                                           |   |   |   |
|   |   |   |   DOMAIN (innermost)                      |   |   |   |
|   |   |   |   Error types, shared types from          |   |   |   |
|   |   |   |   @family-app/shared, pure logic          |   |   |   |
|   |   |   |                                           |   |   |   |
|   |   |   +-------------------------------------------+   |   |   |
|   |   |                                                   |   |   |
|   |   +---------------------------------------------------+   |   |
|   |                                                           |   |
|   +-----------------------------------------------------------+   |
|                                                                   |
|   REPOSITORY IMPLEMENTATIONS (Infrastructure - outermost)         |
|   DynamoDB concrete repos, S3 storage, external service clients   |
|                                                                   |
+-------------------------------------------------------------------+
```

### Directory Mapping

```
packages/backend/src/
├── domain/              <-- Domain layer
│   └── errors/          <-- DomainError base + subtypes
├── handlers/            <-- Handler/Infrastructure layer (Lambda entry points)
│   └── auth/
│       └── register.ts
├── use-cases/           <-- Application layer
│   ├── auth/            <-- register-with-phone, login-with-phone, social-login, ...
│   ├── family/          <-- create-family, invite-member, accept-invitation, ...
│   ├── relationships/
│   ├── tree/            <-- build-family-tree, cached-family-tree
│   ├── feed/
│   ├── calendar/        <-- create-event, edit-event, rsvp-event, ...
│   ├── chores/          <-- create-chore, rotate-chore, complete-chore, ...
│   ├── notifications/
│   └── media/
├── repositories/
│   ├── interfaces/      <-- Domain boundary (pure TypeScript interfaces)
│   └── dynamodb/        <-- Infrastructure implementations
└── shared/              <-- Internal utilities (permission-check, etc.)
```

---

## Request Lifecycle

Every request follows the same path through the system. No shortcuts, no layer skipping.

```
Client (React Native / Web)
  |
  |  GraphQL mutation/query
  v
+------------------+
|  AWS AppSync     |  Authenticates via Cognito JWT.
|  (GraphQL API)   |  Routes to the correct Lambda resolver.
+--------+---------+
         |
         v
+------------------+
|  Lambda Handler  |  THIN (5-10 lines of glue code).
|  handlers/...    |  1. Instantiates concrete repo(s)
|                  |  2. Instantiates use case with repo(s)
|                  |  3. Calls useCase.execute(event.arguments)
|                  |  4. Catches DomainError, re-throws as GraphQL error
+--------+---------+
         |
         v
+------------------+
|  Use Case        |  BUSINESS LOGIC lives here.
|  use-cases/...   |  1. Validates input (Zod schemas from @family-app/shared)
|                  |  2. Checks permissions (requireRole)
|                  |  3. Orchestrates repository calls
|                  |  4. Throws domain errors on failure
|                  |  5. Returns typed result
+--------+---------+
         |
         |  Calls methods on repository INTERFACES (not implementations)
         v
+------------------+
|  Repository      |  IMPLEMENTATION lives here.
|  repositories/   |  Translates domain operations into DynamoDB calls.
|  dynamodb/...    |  Uses key builders, GSI queries, batch operations.
+--------+---------+
         |
         v
+------------------+
|  DynamoDB        |  Single table, on-demand billing, 2 GSIs.
|  (single table)  |
+------------------+
```

### Concrete Example: User Registration

```
AppSync                    Handler                     Use Case                Repository        DynamoDB
  |                          |                           |                       |                  |
  |--registerUser(args)----->|                           |                       |                  |
  |                          |--new DynamoUserRepo()---->|                       |                  |
  |                          |--new RegisterWithPhone--->|                       |                  |
  |                          |     (userRepo)            |                       |                  |
  |                          |--execute(args)----------->|                       |                  |
  |                          |                           |--getByPhone(phone)--->|                  |
  |                          |                           |                       |--Query(GSI1)---->|
  |                          |                           |                       |<----item/null----|
  |                          |                           |<--User | undefined----|                  |
  |                          |                           |                       |                  |
  |                          |                           | if exists: throw      |                  |
  |                          |                           |   UserAlreadyExists   |                  |
  |                          |                           |                       |                  |
  |                          |                           |--create(user)-------->|                  |
  |                          |                           |                       |--PutItem-------->|
  |                          |                           |<--void----------------|                  |
  |                          |<--{ user }----------------|                       |                  |
  |<---user data-------------|                           |                       |                  |
```

---

## Layer Boundary Rules

Each layer has strict rules about what it can import. Violations should be caught by ESLint boundary rules (see [ESLint Boundary Enforcement](#eslint-boundary-enforcement)).

| Layer                                                     | Can Import                                                                                       | CANNOT Import                                      | Rationale                                                                |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------ |
| **Domain** (`domain/`)                                    | `@family-app/shared` types                                                                       | Use cases, repositories, handlers, AWS SDK         | Domain is pure; no infrastructure dependencies                           |
| **Repository Interfaces** (`repositories/interfaces/`)    | `@family-app/shared` types, domain errors                                                        | Use cases, handlers, DynamoDB client, AWS SDK      | Interfaces define contracts, not implementations                         |
| **Use Cases** (`use-cases/`)                              | Repository interfaces, domain errors, `@family-app/shared` types/validation, `shared/` utilities | Handlers, DynamoDB client, AWS SDK, concrete repos | Use cases depend on abstractions, never concrete infra                   |
| **Handlers** (`handlers/`)                                | Use cases, concrete repositories, domain errors                                                  | Nothing is off-limits (outermost layer)            | Handlers are the composition root; they wire everything together         |
| **Repository Implementations** (`repositories/dynamodb/`) | Repository interfaces, `@family-app/shared` types, AWS SDK, domain errors                        | Use cases, handlers                                | Implements interfaces; knows about DynamoDB but not about business logic |
| **Shared Utilities** (`shared/`)                          | `@family-app/shared` types, domain errors                                                        | Use cases, handlers, concrete repos                | Cross-cutting concerns (permissions, etc.)                               |

### The Golden Rule

> Use cases never import from `repositories/dynamodb/` or `aws-sdk`. They only import from `repositories/interfaces/`. This is what makes the business logic testable without DynamoDB.

---

## Dependency Injection Pattern

The backend uses **constructor injection**. Use cases declare their dependencies as constructor parameters typed to repository interfaces. Handlers (the composition root) instantiate the concrete implementations and pass them in.

### Pattern

```typescript
// 1. INTERFACE -- repositories/interfaces/user-repo.ts
export interface IUserRepository {
  create(user: User): Promise<void>;
  getById(userId: string): Promise<User | undefined>;
  getByPhone(phone: string): Promise<User | undefined>;
  getByCognitoSub(cognitoSub: string): Promise<User | undefined>;
  updateProfile(userId: string, profile: UserProfile): Promise<void>;
}

// 2. USE CASE -- use-cases/auth/register-with-phone.ts
export class RegisterWithPhone {
  constructor(private readonly userRepo: IUserRepository) {}
                                        ^^^^^^^^^^^^^^^^^
                                        Interface, not DynamoUserRepository

  async execute(input: RegisterInput): Promise<RegisterResult> {
    const existing = await this.userRepo.getByPhone(input.phone);
    if (existing !== undefined) {
      throw new UserAlreadyExistsError(input.phone);
    }
    // ... create and return user
  }
}

// 3. HANDLER (composition root) -- handlers/auth/register.ts
const userRepo = new DynamoUserRepository();           // Concrete impl
const registerUseCase = new RegisterWithPhone(userRepo); // Inject

export async function handler(event: AppSyncResolverEvent<RegisterArgs>) {
  try {
    const result = await registerUseCase.execute({
      phone: event.arguments.phone,
      cognitoSub: event.arguments.cognitoSub,
      displayName: event.arguments.displayName,
    });
    return result.user;
  } catch (error) {
    if (error instanceof DomainError) {
      throw new Error(`${error.code}: ${error.message}`);
    }
    throw error;
  }
}
```

### Why This Matters

- **Testing**: Unit tests inject mock/stub repositories. No DynamoDB needed.
- **Swappability**: Replace DynamoDB with PostgreSQL by writing a new implementation. Zero changes to use cases.
- **Clarity**: Each use case's constructor signature is its dependency manifest.

### Handler Rules

Handlers must remain thin -- **5 to 10 lines of actual logic**. Their only responsibilities are:

1. Instantiate concrete repositories (outside the handler function, for Lambda reuse)
2. Instantiate use case(s) with those repositories
3. Extract arguments from the AppSync event
4. Call `useCase.execute(...)` and return the result
5. Catch `DomainError` and re-throw as a formatted string error for AppSync

Handlers must NOT contain business logic, validation, or direct database calls.

---

## Domain Error Types

All domain errors extend the abstract `DomainError` base class. Each error carries a machine-readable `code` and an HTTP-equivalent `statusCode` for consistent error handling across the stack.

### Base Class

```typescript
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
```

### Error Inventory

| Error Class              | Code                  | Status     | File                      | When Thrown                                                    |
| ------------------------ | --------------------- | ---------- | ------------------------- | -------------------------------------------------------------- |
| `DomainError`            | (abstract)            | (abstract) | `domain/errors/base.ts`   | Never directly -- base class only                              |
| `InvalidOtpError`        | `INVALID_OTP`         | 401        | `domain/errors/auth.ts`   | OTP verification fails or OTP is expired                       |
| `UserAlreadyExistsError` | `USER_ALREADY_EXISTS` | 409        | `domain/errors/auth.ts`   | Registration with a phone number already in use                |
| `UserNotFoundError`      | `USER_NOT_FOUND`      | 404        | `domain/errors/auth.ts`   | Login or lookup for a non-existent user                        |
| `PermissionDeniedError`  | `PERMISSION_DENIED`   | 403        | `domain/errors/common.ts` | `requireRole()` check fails, or action not allowed for role    |
| `NotFoundError`          | `NOT_FOUND`           | 404        | `domain/errors/common.ts` | Generic entity lookup failure (family, post, event, etc.)      |
| `ValidationError`        | `VALIDATION_ERROR`    | 400        | `domain/errors/common.ts` | Zod schema validation fails, or business rule violated         |
| `ActivationGateError`    | `ACTIVATION_GATE`     | 403        | `domain/errors/common.ts` | Content creation attempted before family has 2+ active members |

### Error Handling Flow

```
Use Case throws DomainError
        |
        v
Handler catches it
        |
        v
Re-throws as: new Error(`${error.code}: ${error.message}`)
        |
        v
AppSync returns structured error to client
        |
        v
Mobile app parses error.code to show localized message
```

### Adding New Domain Errors

1. Create the class extending `DomainError` in the appropriate file under `domain/errors/`
2. Assign a unique `code` string (SCREAMING_SNAKE_CASE)
3. Choose the correct `statusCode` (400, 401, 403, 404, 409, etc.)
4. Re-export from `domain/errors/index.ts`

---

## Permission System

### Role Hierarchy

The app defines four roles with a strict numeric hierarchy. Higher numbers grant more privileges.

```
         owner (4)
           |
           |  can do everything, transfer ownership
           v
         admin (3)
           |
           |  can manage members, roles (up to editor), settings
           v
        editor (2)
           |
           |  can create/edit posts, events, chores
           v
        viewer (1)
           |
           |  read-only access to family content
           v
      (no access)
```

Roles are defined in the shared package:

```typescript
// @family-app/shared -- types/roles.ts
export const ROLES = ["owner", "admin", "editor", "viewer"] as const;
export type Role = (typeof ROLES)[number];
```

### requireRole() Utility

The `requireRole()` function is the single gate for all permission checks. It lives in `packages/backend/src/shared/permission-check.ts`.

```typescript
const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

export function requireRole(userRole: Role, minimumRole: Role, action: string): void {
  if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[minimumRole]) {
    throw new PermissionDeniedError(action);
  }
}
```

### Usage in Use Cases

```typescript
// In a use case -- e.g., create-event.ts
export class CreateEvent {
  constructor(
    private readonly membershipRepo: IMembershipRepository,
    private readonly eventRepo: IEventRepository,
  ) {}

  async execute(input: CreateEventInput): Promise<Event> {
    const membership = await this.membershipRepo.get(input.familyId, input.userId);
    if (!membership) throw new NotFoundError("Membership", input.userId);

    requireRole(membership.role, "editor", "create events");
    //          ^^^^^^^^^^^^^^^  ^^^^^^^^  ^^^^^^^^^^^^^^^^^
    //          caller's role    minimum   action description (used in error message)

    // ... proceed with event creation
  }
}
```

### Role Requirement Matrix

| Action               | Minimum Role | Notes                              |
| -------------------- | ------------ | ---------------------------------- |
| View family content  | `viewer`     | Default role for new members       |
| Create/edit posts    | `editor`     |                                    |
| Create/edit events   | `editor`     |                                    |
| Create/edit chores   | `editor`     |                                    |
| RSVP to events       | `viewer`     | All members can respond            |
| Invite members       | `admin`      |                                    |
| Remove members       | `admin`      | Cannot remove owner                |
| Change member roles  | `admin`      | Can only set roles up to own level |
| Edit family settings | `admin`      |                                    |
| Transfer ownership   | `owner`      | Only current owner                 |
| Delete family        | `owner`      |                                    |

---

## Repository Interfaces

All 16 repository interfaces live in `packages/backend/src/repositories/interfaces/`. They define the contracts that use cases depend on.

| Interface                           | File                   | Purpose                                             |
| ----------------------------------- | ---------------------- | --------------------------------------------------- |
| `IUserRepository`                   | `user-repo.ts`         | User CRUD, lookup by phone/cognitoSub               |
| `IFamilyRepository`                 | `family-repo.ts`       | Family CRUD, metadata                               |
| `IPersonRepository`                 | `person-repo.ts`       | Person records (app users + non-app family members) |
| `IMembershipRepository`             | `membership-repo.ts`   | User-to-family membership with role                 |
| `IInvitationRepository`             | `invitation-repo.ts`   | Pending invitations by phone number                 |
| `IRelationshipRepository`           | `relationship-repo.ts` | Parent-child, spouse, sibling links between persons |
| `IPostRepository`                   | `post-repo.ts`         | Feed posts with pagination                          |
| `ICommentRepository`                | `post-repo.ts`         | Comments on posts                                   |
| `IReactionRepository`               | `post-repo.ts`         | Emoji reactions on posts                            |
| `IEventRepository`                  | `event-repo.ts`        | Calendar events, recurring events                   |
| `IEventRSVPRepository`              | `event-repo.ts`        | RSVP responses to events                            |
| `INotificationPreferenceRepository` | `notification-repo.ts` | Per-family, per-category notification preferences   |
| `IDeviceTokenRepository`            | `notification-repo.ts` | Push notification device tokens                     |
| `IMediaRepository`                  | `media-repo.ts`        | Media metadata (photos, videos)                     |
| `IStorageService`                   | `media-repo.ts`        | Presigned URL generation (S3 abstraction)           |
| `IChoreRepository`                  | `chore-repo.ts`        | Household chore definitions and assignments         |

### Interface Design Conventions

- Return `Promise<T | undefined>` for single-entity lookups (never throw on "not found" at the repo level).
- Return `Promise<T[]>` for list operations.
- Use `PaginatedResult<T>` for feed-style queries that support cursor-based pagination.
- Accept domain types from `@family-app/shared` -- never DynamoDB-specific structures.

---

## DynamoDB Single-Table Design

All data lives in one DynamoDB table with two Global Secondary Indexes (GSIs). Key construction is centralized in `repositories/dynamodb/keys.ts`.

### Table Structure

```
+------------------+-------------------------------------+------------+------------+
| PK               | SK                                  | GSI1PK     | GSI1SK     |
+------------------+-------------------------------------+------------+------------+
| USER#<userId>    | PROFILE                             | PHONE#<ph> | USER#<id>  |
| USER#<userId>    | DEVICE#<token>                      |            |            |
| USER#<userId>    | NOTIFPREF#<famId>#<category>        |            |            |
| FAMILY#<famId>   | METADATA                            |            |            |
| FAMILY#<famId>   | MEMBER#<personId>                   | USER#<uid> | FAM#<fId>  |
| FAMILY#<famId>   | PERSON#<personId>                   | PERSON#<p> |            |
| FAMILY#<famId>   | REL#<personA>#<personB>             | RELP#<B>#A |            |
| FAMILY#<famId>   | POST#<timestamp>#<postId>           |            |            |
| FAMILY#<famId>   | EVENT#<date>#<eventId>              |            | GSI2: ...  |
| FAMILY#<famId>   | CHORE#<choreId>                     |            |            |
| FAMILY#<famId>   | INVITE#<phone>                      |            |            |
| FAMILY#<famId>   | TREE_CACHE                          |            |            |
| POST#<postId>    | COMMENT#<timestamp>#<commentId>     |            |            |
| POST#<postId>    | REACTION#<personId>                 |            |            |
| POST#<postId>    | MEDIA#<orderIdx>#<mediaId>          |            |            |
| EVENT#<eventId>  | RSVP#<personId>                     |            |            |
+------------------+-------------------------------------+------------+------------+
```

### Access Patterns

| Access Pattern                   | Key Condition                                      | Index |
| -------------------------------- | -------------------------------------------------- | ----- |
| Get user by ID                   | `PK = USER#<id>, SK = PROFILE`                     | Table |
| Get user by phone                | `GSI1PK = PHONE#<phone>`                           | GSI1  |
| List family members              | `PK = FAMILY#<id>, SK begins_with MEMBER#`         | Table |
| List family posts (newest first) | `PK = FAMILY#<id>, SK begins_with POST#` (reverse) | Table |
| List family events by date       | `PK = FAMILY#<id>, SK begins_with EVENT#`          | Table |
| List comments on a post          | `PK = POST#<id>, SK begins_with COMMENT#`          | Table |
| Get all families for a user      | `GSI1PK = USER#<uid>`                              | GSI1  |
| Reverse relationship lookup      | `GSI1PK = RELP#<personB>#<personA>`                | GSI1  |
| Events by type                   | `GSI2PK = EVTYPE#<famId>#<type>`                   | GSI2  |

### Key Builder Usage

All key construction goes through the centralized `keys` object. Never build key strings manually.

```typescript
import { keys } from "./keys";

// Correct
const pk = keys.family.pk(familyId); // "FAMILY#abc-123"
const sk = keys.family.sk.member(personId); // "MEMBER#def-456"

// WRONG -- never do this
const pk = `FAMILY#${familyId}`;
```

---

## Validation at API Boundaries

Input validation uses Zod schemas defined in the shared package (`@family-app/shared/validation/`). Validation happens at the use case layer, not in handlers.

### Available Validation Schemas

Validation schemas exist for: `family`, `post`, `event`, `relationship`, `chore`, `media` -- all in `packages/shared/src/validation/`.

### Pattern

```typescript
import { createEventSchema } from "@family-app/shared";

export class CreateEvent {
  async execute(input: unknown): Promise<Event> {
    const validated = createEventSchema.parse(input); // Throws ZodError
    // ... use validated data with full type safety
  }
}
```

Zod validation errors are caught and wrapped in `ValidationError` before reaching the handler, keeping error handling consistent across the domain error system.

---

## ESLint Boundary Enforcement

Layer boundary rules should be enforced at build time via ESLint. Cross-reference `quality-standards.md` for the full ESLint configuration.

### Enforced Rules

| Rule                                                                                | Enforces                                                      |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `use-cases/` cannot import from `repositories/dynamodb/`                            | Use cases depend on interfaces, not implementations           |
| `use-cases/` cannot import from `handlers/`                                         | No circular dependency between application and infrastructure |
| `domain/` cannot import from `use-cases/`, `handlers/`, or `repositories/dynamodb/` | Domain stays pure                                             |
| `repositories/interfaces/` cannot import from `repositories/dynamodb/`              | Interface definitions stay abstract                           |
| No `aws-sdk` imports in `use-cases/` or `domain/`                                   | Infrastructure concerns stay in infrastructure layer          |

These rules ensure that the architecture diagram above is not just a suggestion but a compiler-enforced reality. Violations fail CI.

---

## Summary

The backend architecture can be distilled into five principles:

1. **Dependencies point inward.** Handlers depend on use cases, use cases depend on interfaces, interfaces depend on domain types. Never the reverse.
2. **Handlers are thin.** 5-10 lines. They wire dependencies and translate errors. Nothing else.
3. **Use cases own the business logic.** All decisions, validations, and orchestration happen here.
4. **Repositories are abstract.** Use cases never know about DynamoDB. They talk to interfaces.
5. **Errors are typed.** Every failure mode has a domain error with a code and status. No generic throws.
