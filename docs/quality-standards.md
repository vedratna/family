# Quality Standards

> Last reviewed: 2026-04-07

This document is the quality constitution for the family-app project. Every rule has a rationale. When in doubt, reference this document.

---

## 1. TypeScript Strict Mode

Every package uses `strict: true` plus additional flags. Here's what each flag catches:

| Flag                               | What It Catches                                                                    | Why                                                                   |
| ---------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `strict: true`                     | Enables all strict checks (strictNullChecks, strictFunctionTypes, etc.)            | Foundation of type safety                                             |
| `noUncheckedIndexedAccess`         | Array/object access returns `T \| undefined`, forcing you to handle missing values | Critical for DynamoDB results where items may not exist               |
| `noImplicitReturns`                | Functions with branches must explicitly return in all paths                        | Prevents accidentally returning `undefined`                           |
| `noFallthroughCasesInSwitch`       | Switch cases must break or return                                                  | Prevents accidental fallthrough bugs                                  |
| `forceConsistentCasingInFileNames` | `import "./File"` must match actual filename casing                                | Prevents cross-platform bugs (macOS is case-insensitive, Linux isn't) |
| `exactOptionalPropertyTypes`       | `prop?: string` means the property is absent, NOT `string \| undefined`            | Prevents assigning `undefined` to optional properties                 |

---

## 2. No Defensive Code

**Principle:** Trust the type system and framework guarantees. Validate at system boundaries (API input via Zod), trust internal code after that.

### Banned Patterns (with examples)

**Null-checking TypeScript-guaranteed non-null values:**

```typescript
// BAD: TypeScript already guarantees user is non-null
function getUser(user: User) {
  if (user === null || user === undefined) {
    return;
  }
  return user.name;
}

// GOOD: Trust the type
function getUser(user: User) {
  return user.name;
}
```

**Try/catch around non-throwing code:**

```typescript
// BAD: Arithmetic cannot throw
try {
  const total = price * quantity;
} catch (e) {
  // impossible
}

// GOOD: Just do it
const total = price * quantity;
```

**typeof checks on already-typed values:**

```typescript
// BAD: x is already typed as string
function format(x: string) {
  if (typeof x === "string") {
    return x.trim();
  }
  return "";
}

// GOOD: Trust the type
function format(x: string) {
  return x.trim();
}
```

**Commented-out code:**

```typescript
// BAD: Dead code left "just in case"
// const oldFunction = () => { ... };

// GOOD: Delete it. Git remembers.
```

**Empty catch blocks:**

```typescript
// BAD: Swallowing errors silently
try {
  await saveData();
} catch (e) {
  // ignore
}

// GOOD: Handle or rethrow with typed error
try {
  await saveData();
} catch (e) {
  throw new ValidationError(`Failed to save: ${String(e)}`);
}
```

**Redundant else after return:**

```typescript
// BAD: Unnecessary nesting
function check(value: number) {
  if (value > 10) {
    return "high";
  } else {
    return "low";
  }
}

// GOOD: Early return
function check(value: number) {
  if (value > 10) {
    return "high";
  }
  return "low";
}
```

---

## 3. No Dead Code

- No commented-out code blocks — git history preserves everything
- No unused imports, variables, functions, or parameters — delete them
- No unreachable code after return/throw/break

**Enforced by ESLint:** `no-unused-vars` (error), `no-unreachable`

---

## 4. Fail Fast, Fail Loud

**Principle:** If something unexpected happens, throw a typed domain error. Never silently handle it with a fallback.

```
┌──────────────────────────────────────────────────────┐
│                ERROR HANDLING STRATEGY                │
│                                                      │
│  System boundary (API input):                        │
│    → Validate with Zod schema                        │
│    → Reject with ValidationError if invalid          │
│                                                      │
│  Business logic (use cases):                         │
│    → Permission check: throw PermissionDeniedError   │
│    → Not found: throw NotFoundError                  │
│    → Activation gate: throw ActivationGateError      │
│    → Trust internal types after boundary validation  │
│                                                      │
│  Never:                                              │
│    → Return null/undefined as "not found"            │
│    → Catch and return a default value                │
│    → Log and continue                                │
└──────────────────────────────────────────────────────┘
```

**Domain error types:**

| Error                    | Code                | HTTP | When                  |
| ------------------------ | ------------------- | ---- | --------------------- |
| `ValidationError`        | VALIDATION_ERROR    | 400  | Zod validation fails  |
| `InvalidOtpError`        | INVALID_OTP         | 401  | OTP incorrect/expired |
| `PermissionDeniedError`  | PERMISSION_DENIED   | 403  | Role insufficient     |
| `ActivationGateError`    | ACTIVATION_GATE     | 403  | Family < 2 members    |
| `NotFoundError`          | NOT_FOUND           | 404  | Entity doesn't exist  |
| `UserNotFoundError`      | USER_NOT_FOUND      | 404  | User lookup fails     |
| `UserAlreadyExistsError` | USER_ALREADY_EXISTS | 409  | Duplicate phone       |

---

## 5. Testing Standards

### Testing Pyramid

```
          ╱╲
         ╱  ╲         E2E (5%) — Detox
        ╱ 5% ╲        Critical user flows only
       ╱──────╲
      ╱        ╲       Integration (20%)
     ╱   20%    ╲      Lambda + DynamoDB Local
    ╱────────────╲
   ╱              ╲     Unit (75%)
  ╱     75%        ╲    Use cases, domain, hooks, components
 ╱──────────────────╲
```

### Coverage Thresholds

| Scope                  | Minimum    | Enforced |
| ---------------------- | ---------- | -------- |
| Overall (all packages) | 80% lines  | CI gate  |
| `use-cases/` directory | 100% lines | CI gate  |

### What to Test at Each Level

**Unit tests:**

- Use cases with mocked repository interfaces
- Domain model logic
- Relationship inference engine (exhaustive cases)
- Tree building algorithm
- React hooks (`@testing-library/react-hooks`)
- Components (React Native Testing Library)

**Integration tests:**

- Lambda handlers with DynamoDB Local (real DB operations)
- Permission enforcement across all operations

**E2E tests (Detox):**

- Register → create family → invite → locked feed
- Invitee accepts → mini-tour → post
- Family switching with theme change
- Event creation → reminder notification

### Prohibited Patterns

- No testing implementation details (test behavior, not internal state)
- No snapshot-only tests (snapshots are fragile and don't test behavior)
- No `any` in test files (same rules as production code)

---

## 6. ESLint Rules Inventory

| Rule                                                | What It Catches              | Rationale                                                                                      |
| --------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------- |
| `@typescript-eslint/no-explicit-any`                | Usage of `any` type          | Forces proper typing, prevents type escape hatches                                             |
| `@typescript-eslint/no-floating-promises`           | Unawaited promises           | Prevents silent async failures                                                                 |
| `@typescript-eslint/strict-boolean-expressions`     | Truthy/falsy on non-booleans | Prevents `if (string)` instead of `if (string.length > 0)`                                     |
| `@typescript-eslint/no-unused-vars`                 | Unused variables/imports     | Dead code detection                                                                            |
| `@typescript-eslint/no-unnecessary-condition`       | Conditions always true/false | Catches defensive null-checks on guaranteed non-null                                           |
| `@typescript-eslint/no-redundant-type-constituents` | Redundant type unions        | Catches `string \| never`                                                                      |
| `@typescript-eslint/no-useless-constructor`         | Empty constructors           | Dead code                                                                                      |
| `no-else-return`                                    | Else after return            | Reduces nesting                                                                                |
| `no-unreachable`                                    | Code after return/throw      | Dead code                                                                                      |
| `import/no-cycle`                                   | Circular imports             | Prevents dependency cycles                                                                     |
| `boundaries/element-types`                          | Cross-layer imports          | Enforces clean architecture (see [Architecture Patterns](#8-architecture-pattern-enforcement)) |

---

## 7. CI/CD Pipeline Gates

All 7 gates must pass before a PR can be merged. No exceptions.

```
PR Created
 │
 ├──▶ [1] Lint & Format Check      ─┐
 ├──▶ [2] Type Check                 ├── Run in parallel
 ├──▶ [3] Unit Tests + Coverage     ─┘
 │
 ├──▶ [4] Integration Tests          ← Needs DynamoDB Local (Docker)
 ├──▶ [5] Build Check                ← Backend bundles + Mobile builds
 ├──▶ [6] Bundle Size Check          ← Fail if mobile exceeds threshold
 └──▶ [7] Security Audit             ← npm audit
 │
 ALL PASS ──▶ PR mergeable
 ANY FAIL ──▶ PR blocked
```

---

## 8. Architecture Pattern Enforcement

### Layer Rules (enforced by `eslint-plugin-boundaries`)

```
┌─────────────────────────────────────────────┐
│           DEPENDENCY DIRECTION               │
│                                             │
│  Handlers ───▶ Use Cases ───▶ Domain       │
│     │              │                         │
│     │              ▼                         │
│     │         Repo Interfaces                │
│     │                                        │
│     └────────▶ Repo Implementations          │
│                    │                         │
│                    ▼                         │
│              DynamoDB / S3 / SNS             │
└─────────────────────────────────────────────┘
```

| Layer                      | Can Import                                       | Cannot Import                     |
| -------------------------- | ------------------------------------------------ | --------------------------------- |
| `domain/`                  | Nothing                                          | Everything else                   |
| `repositories/interfaces/` | `domain/`                                        | use-cases, handlers, dynamodb     |
| `use-cases/`               | `domain/`, `repositories/interfaces/`, `shared/` | handlers, repositories/dynamodb   |
| `repositories/dynamodb/`   | `domain/`, `repositories/interfaces/`            | use-cases, handlers               |
| `handlers/`                | All layers                                       | —                                 |
| `shared/`                  | `domain/`                                        | use-cases, handlers, repositories |

> See [01-backend.md](architecture/01-backend.md) for detailed architecture explanation.

---

## 9. Commit & PR Standards

### Conventional Commits

Format: `<type>(<scope>): <description>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

Examples:

```
feat(feed): add post creation with media upload
fix(tree): correct spouse generation assignment in BFS
test(relationships): add cousin inference edge cases
docs(architecture): add data model deep dive
```

### PR Review Checklist

```
☐ Follows layer boundaries (handler → use case → repo)
☐ Input validated at API boundary with Zod
☐ Permissions checked before business logic
☐ DynamoDB access pattern documented (if new)
☐ Error cases use typed domain errors
☐ Tests cover happy path AND edge cases
☐ No business logic in Lambda handlers
☐ No business logic in React screens
☐ No defensive code patterns
☐ No dead code (unused imports, commented-out blocks)
☐ All CI gates pass
```

---

## 10. Prettier & Formatting

### Configuration

| Setting         | Value    | Why                                            |
| --------------- | -------- | ---------------------------------------------- |
| `semi`          | `true`   | Explicit statement termination                 |
| `singleQuote`   | `false`  | Consistency — double quotes throughout         |
| `trailingComma` | `all`    | Cleaner git diffs                              |
| `printWidth`    | `100`    | Readable without horizontal scrolling          |
| `tabWidth`      | `2`      | Standard for TypeScript                        |
| `arrowParens`   | `always` | Consistent arrow function style                |
| `endOfLine`     | `lf`     | Unix line endings (cross-platform consistency) |

### Pre-commit Flow

```
Developer runs: git commit
 │
 ▼
Husky triggers: pre-commit hook
 │
 ▼
lint-staged runs on STAGED files only:
 │
 ├── *.ts, *.tsx → ESLint --fix → Prettier --write
 └── *.json, *.md → Prettier --write
 │
 ▼
Husky triggers: commit-msg hook
 │
 ▼
commitlint validates conventional commit format
 │
 ▼
Commit succeeds (or fails with clear error)
```
