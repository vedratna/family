# System Overview

> Last reviewed: 2026-04-07

A privacy-first family app for extended families to connect, share, and organize. Members create family groups, share posts/photos/videos, manage shared calendars, visualize auto-generated family trees, and coordinate household chores — all in a private space with no ads or data selling.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                 │
│                                                                 │
│   ┌──────────────┐         ┌──────────────┐                    │
│   │ React Native │         │  React Web   │                    │
│   │  (Expo)      │         │  (Phase 2)   │                    │
│   │  iOS+Android │         │              │                    │
│   └──────┬───────┘         └──────┬───────┘                    │
└──────────┼────────────────────────┼─────────────────────────────┘
           │         GraphQL        │
           ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                        AWS CLOUD                                │
│                                                                 │
│   ┌─────────────┐                                              │
│   │  Cognito    │  Auth (phone OTP, Google, Apple)             │
│   └─────────────┘                                              │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐ │
│   │                     AppSync (GraphQL API)                 │ │
│   └───────────────────────────┬──────────────────────────────┘ │
│                               │                                 │
│           ┌───────────────────┼───────────────────┐            │
│           ▼                   ▼                   ▼            │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐     │
│   │   Lambda     │   │   Lambda     │   │   Lambda     │     │
│   │  (Auth)      │   │  (Family/    │   │  (Calendar/  │     │
│   │              │   │   Feed/Tree) │   │   Notifs)    │     │
│   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘     │
│          │                  │                   │              │
│   ┌──────▼──────────────────▼───────────────────▼──────┐      │
│   │                  DynamoDB                           │      │
│   │            (single-table design)                    │      │
│   │          On-demand billing, 2 GSIs                  │      │
│   └─────────────────────────────────────────────────────┘      │
│                                                                 │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐     │
│   │     S3       │   │     SNS      │   │ EventBridge  │     │
│   │  (media)     │   │  (push       │   │ (scheduled   │     │
│   │              │   │  notifs)     │   │  reminders)  │     │
│   └──────────────┘   └──────────────┘   └──────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer         | Technology              | Why                                                         |
| ------------- | ----------------------- | ----------------------------------------------------------- |
| Mobile        | React Native (Expo)     | Single codebase for iOS + Android                           |
| API           | AWS AppSync (GraphQL)   | Typed queries, real-time subscriptions, reduced round-trips |
| Auth          | AWS Cognito             | Phone OTP + Google/Apple social login, managed              |
| Compute       | AWS Lambda              | Pay-per-request, zero cost at idle                          |
| Database      | DynamoDB (single-table) | Near-zero cost at low scale, on-demand billing              |
| Media         | S3 + presigned URLs     | Direct client upload, cheap storage                         |
| Notifications | SNS                     | Cross-platform push notifications                           |
| Scheduling    | EventBridge             | Cron-based event reminders                                  |
| Infra         | AWS CDK (TypeScript)    | Type-safe infrastructure, same language as app              |
| Monorepo      | Turborepo               | Build caching, parallel tasks                               |
| Testing       | Vitest                  | Fast, TypeScript-native                                     |

## Monorepo Structure

```
family/
├── packages/
│   ├── shared/          ← Types, Zod validation, constants (used by all)
│   ├── backend/         ← Lambda handlers, use cases, repositories
│   ├── mobile/          ← React Native (Expo) app
│   └── infra/           ← AWS CDK stacks
├── docs/                ← You are here
├── .github/workflows/   ← CI pipeline
├── turbo.json           ← Turborepo config
├── tsconfig.base.json   ← Shared TypeScript strict config
└── eslint.config.mjs    ← Shared ESLint config
```

## Where Does X Live?

| Feature                | Backend                      | Mobile                    | Shared                  |
| ---------------------- | ---------------------------- | ------------------------- | ----------------------- |
| Auth (login, register) | `use-cases/auth/`            | `features/auth/`          | `types/user.ts`         |
| Family CRUD            | `use-cases/family/`          | `features/family/`        | `types/family.ts`       |
| Member relationships   | `use-cases/relationships/`   | `features/relationships/` | `types/relationship.ts` |
| Family tree            | `use-cases/tree/`            | `features/tree/`          | —                       |
| Social feed            | `use-cases/feed/`            | `features/feed/`          | `types/post.ts`         |
| Calendar               | `use-cases/calendar/`        | `features/calendar/`      | `types/event.ts`        |
| Notifications          | `use-cases/notifications/`   | `features/notifications/` | `types/notification.ts` |
| Media upload           | `use-cases/media/`           | —                         | `types/media.ts`        |
| Chores                 | `use-cases/chores/`          | `features/chores/`        | `types/chore.ts`        |
| Onboarding             | —                            | `features/onboarding/`    | —                       |
| Theming                | —                            | `shared/theme/`           | `types/theme.ts`        |
| DynamoDB keys/ops      | `repositories/dynamodb/`     | —                         | —                       |
| Validation schemas     | —                            | —                         | `validation/*.ts`       |
| Domain errors          | `domain/errors/`             | —                         | —                       |
| Permission checks      | `shared/permission-check.ts` | —                         | `types/roles.ts`        |
| CDK infrastructure     | —                            | —                         | `infra/lib/`            |
