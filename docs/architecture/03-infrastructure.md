# Infrastructure Architecture

> Last reviewed: 2026-04-07

This document describes the AWS infrastructure for the Family app, defined as CDK (TypeScript) stacks in `packages/infra/lib/`. All resources deploy to `ap-south-1` (Mumbai) by default.

## Entry Point

```
packages/infra/lib/app.ts
```

The entry point reads a `stage` context variable (defaults to `"dev"`) and the AWS account/region from environment variables (`CDK_DEFAULT_ACCOUNT`, `CDK_DEFAULT_REGION`), falling back to `ap-south-1`. Each stack is named `Family-{stage}-{StackName}`.

## CDK Stacks

### 1. AuthStack

**File:** `packages/infra/lib/auth-stack.ts`
**CloudFormation name:** `Family-{stage}-Auth`

| Resource | Type | Details |
|----------|------|---------|
| FamilyUserPool | Cognito User Pool | Phone sign-in only, auto-verify phone, password policy (8+ chars, upper/lower/digit), phone-only account recovery |
| GoogleProvider | Cognito IdP (Google) | OAuth scopes: openid, profile, email. Client secret from SSM `/family/{stage}/google-client-secret` |
| AppleProvider | Cognito IdP (Apple) | Scopes: name, email. Keys from CloudFormation parameters |
| FamilyAppClient | User Pool Client | Custom + SRP auth flows, authorization code grant, OIDC + profile scopes, user existence errors suppressed |

**Outputs:** `UserPoolId`, `UserPoolClientId`

### 2. DatabaseStack

**File:** `packages/infra/lib/database-stack.ts`
**CloudFormation name:** `Family-{stage}-Database`

| Resource | Type | Details |
|----------|------|---------|
| FamilyTable | DynamoDB Table | Single-table design, on-demand billing, PITR enabled |

**Key schema:**

| Key | Partition | Sort | Projection | Purpose |
|-----|-----------|------|------------|---------|
| Primary | `PK` (S) | `SK` (S) | -- | All entity access patterns |
| GSI1 | `GSI1PK` (S) | `GSI1SK` (S) | ALL | Reverse lookups (relationships for a person, posts by user) |
| GSI2 | `GSI2PK` (S) | `GSI2SK` (S) | ALL | Cross-entity queries (user's families, events by date) |

**Outputs:** `TableName`, `TableArn`

### 3. StorageStack

**File:** `packages/infra/lib/storage-stack.ts`
**CloudFormation name:** `Family-{stage}-Storage`

| Resource | Type | Details |
|----------|------|---------|
| MediaBucket | S3 Bucket | Name: `family-{stage}-media-{account}`, all public access blocked, SSE-S3 encryption, unversioned |

**Bucket configuration:**
- **CORS:** PUT + GET from all origins, all headers, 1-hour max age (for presigned URL uploads from mobile clients)
- **Lifecycle:** Abort incomplete multipart uploads after 1 day
- **Auto-delete:** Enabled in non-prod (empties bucket before CloudFormation deletion)

**Outputs:** `MediaBucketName`, `MediaBucketArn`

### 4. ApiStack

**File:** `packages/infra/lib/api-stack.ts`
**CloudFormation name:** `Family-{stage}-Api`

| Resource | Type | Details |
|----------|------|---------|
| FamilyApi | AppSync GraphQL API | Schema loaded from `packages/infra/graphql/schema.graphql` |
| FamilyTableSource | DynamoDB Data Source | Direct resolver access to the DynamoDB table |

**Authorization:**
- **Default:** Cognito User Pool (from AuthStack)
- **Additional:** IAM (for service-to-service calls, EventBridge targets)

**Logging:** ERROR-level field logs to CloudWatch.

**Outputs:** `GraphqlApiUrl`, `GraphqlApiId`

### 5. NotificationStack

**File:** `packages/infra/lib/notification-stack.ts`
**CloudFormation name:** `Family-{stage}-Notification`

| Resource | Type | Details |
|----------|------|---------|
| NotificationTopic | SNS Topic | Name: `family-{stage}-notifications`, display name "Family App Notifications" |

SNS Platform Applications (APNs for iOS, FCM for Android) are created outside CDK via the AWS Console or CLI because they require platform-specific credentials. Their ARNs are stored in SSM Parameter Store and referenced by notification Lambdas at runtime.

**Outputs:** `NotificationTopicArn`

### 6. SchedulerStack

**File:** `packages/infra/lib/scheduler-stack.ts`
**CloudFormation name:** `Family-{stage}-Scheduler`

| Resource | Type | Details |
|----------|------|---------|
| FamilyEventBus | EventBridge Custom Bus | Name: `family-{stage}-events` |
| SchedulerRole | IAM Role | Assumed by `scheduler.amazonaws.com`, invokes Lambda targets for reminders |
| EventArchive | EventBridge Archive | Non-prod only, 7-day retention, filters `source: ["family-app"]` |

**Outputs:** `EventBusName`, `EventBusArn`, `SchedulerRoleArn`

## Stack Dependency Diagram

```
                   ┌────────────┐
                   │  AuthStack │
                   └─────┬──────┘
                         │ userPool
                         ▼
┌───────────────┐  ┌───────────┐
│ DatabaseStack ├──► ApiStack  │
└───────────────┘  └───────────┘
     table ────────────┘

┌───────────────┐     (independent)
│ StorageStack  │
└───────────────┘

┌────────────────────┐  (independent)
│ NotificationStack  │
└────────────────────┘

┌────────────────┐      (independent)
│ SchedulerStack │
└────────────────┘
```

**Dependency summary:**
- `ApiStack` depends on `AuthStack` (receives `userPool`) and `DatabaseStack` (receives `table`).
- `StorageStack`, `NotificationStack`, and `SchedulerStack` are independent and deploy in parallel.
- `AuthStack` and `DatabaseStack` are independent of each other and deploy in parallel.

## AWS Service Topology

```
                          ┌───────────────────────┐
                          │     Mobile Client      │
                          │   (React Native/Expo)  │
                          └───┬──────────┬─────┬───┘
                              │          │     │
             GraphQL (HTTPS)  │  Presigned URL  │  OTP / OAuth
                              │          │     │
    ┌─────────────────────────▼──┐   ┌───▼───┐ │  ┌──────────────┐
    │    AppSync GraphQL API     │   │  S3   │ │  │   Cognito    │
    │  ┌───────────┬──────────┐  │   │ Media │ │  │  User Pool   │
    │  │Cognito    │ IAM      │  │   │Bucket │ └──►              │
    │  │Authorizer │Authorizer│  │   └───────┘    │ Google  Apple│
    │  └───────────┴──────────┘  │                │ Phone OTP    │
    └────────────┬───────────────┘                └──────────────┘
                 │
                 │  VTL / JS Resolvers
                 │
    ┌────────────▼───────────────┐
    │         DynamoDB           │
    │    family-{stage} table    │
    │  PK/SK + GSI1 + GSI2      │
    │  On-demand, PITR enabled   │
    └────────────────────────────┘

    ┌────────────────────┐        ┌──────────────────────────┐
    │        SNS         │        │      EventBridge         │
    │  Notification      │        │  ┌──────────────────┐   │
    │  Topic             │        │  │ Custom Event Bus  │   │
    │                    │        │  └────────┬─────────┘   │
    │  APNs (iOS)        │        │           │              │
    │  FCM  (Android)    │        │  ┌────────▼─────────┐   │
    │  (platform apps    │        │  │ Scheduler Role    │   │
    │   via SSM ARNs)    │        │  │ (invokes Lambda)  │   │
    └────────────────────┘        │  └──────────────────┘   │
                                  │  ┌──────────────────┐   │
                                  │  │ Archive (non-prod)│   │
                                  │  │ 7-day retention   │   │
                                  │  └──────────────────┘   │
                                  └──────────────────────────┘
```

## Stage-Based Configuration

The `stage` context variable (`dev` or `prod`) controls behavior across all stacks:

| Behavior | `dev` | `prod` |
|----------|-------|--------|
| RemovalPolicy (Cognito, DynamoDB, S3) | `DESTROY` | `RETAIN` |
| S3 auto-delete objects | Enabled | Disabled |
| EventBridge Archive | Enabled (7-day retention) | Disabled |
| AppSync X-Ray tracing | Enabled | Disabled |
| Stack naming | `Family-dev-*` | `Family-prod-*` |
| DynamoDB table name | `family-dev` | `family-prod` |
| S3 bucket name | `family-dev-media-{account}` | `family-prod-media-{account}` |

**Rationale:**
- `DESTROY` in dev allows clean teardown with `cdk destroy` without orphaned resources.
- `RETAIN` in prod protects data from accidental stack deletion.
- X-Ray tracing in dev aids debugging without adding cost in production.
- Event archives in dev enable replay and debugging of scheduler events.

## Deployment Flow

### Prerequisites

```bash
# Install dependencies
npm install

# Bootstrap CDK in your AWS account (one-time)
npx cdk bootstrap aws://{ACCOUNT_ID}/ap-south-1
```

### Deploy Commands

```bash
# Deploy all stacks to dev (default)
npx cdk deploy --all --context stage=dev

# Deploy all stacks to prod
npx cdk deploy --all --context stage=prod

# Deploy a single stack
npx cdk deploy Family-dev-Auth --context stage=dev

# Preview changes
npx cdk diff --all --context stage=dev

# Tear down dev environment
npx cdk destroy --all --context stage=dev
```

### Deployment Order

CDK resolves the dependency graph automatically. The effective order is:

```
1. AuthStack       ─┐
   DatabaseStack   ─┤ (parallel, no dependencies)
   StorageStack    ─┤
   NotificationStack─┤
   SchedulerStack  ─┘
2. ApiStack          (waits for AuthStack + DatabaseStack)
```

### Required Parameters and Secrets

Before deploying, the following must be configured:

| Parameter | Type | Where |
|-----------|------|-------|
| `GoogleClientId` | CloudFormation Parameter | Passed at deploy time |
| `/family/{stage}/google-client-secret` | SSM SecureString | AWS SSM Parameter Store |
| `AppleClientId` | CloudFormation Parameter | Passed at deploy time |
| `AppleTeamId` | CloudFormation Parameter | Passed at deploy time |
| `AppleKeyId` | CloudFormation Parameter | Passed at deploy time |
| `ApplePrivateKey` | CloudFormation Parameter | Passed at deploy time |
| SNS Platform App ARNs | SSM Parameter | AWS SSM Parameter Store |

## Cost Model

All services are configured for pay-per-use billing. At low traffic (early-stage family app), monthly costs are minimal.

### DynamoDB (On-Demand)

| Operation | Price (ap-south-1) | Notes |
|-----------|--------------------|-------|
| Write request unit (WRU) | $1.4846 per million | 1 WRU = 1 write up to 1 KB |
| Read request unit (RRU) | $0.2969 per million | 1 RRU = 1 strongly consistent read up to 4 KB |
| Storage | $0.2846 per GB/month | First 25 GB free (free tier) |
| PITR | $0.2277 per GB/month | Continuous backups |
| GSI writes | Same as table writes | Both GSIs use ALL projection |

**Estimate (small family, ~100 daily active users):** Under $1/month for reads and writes. Storage negligible.

### AppSync

| Dimension | Price (ap-south-1) |
|-----------|--------------------|
| Query and mutation operations | $4.00 per million |
| Real-time updates (subscriptions) | $2.00 per million connection-minutes |
| Data transfer | Standard AWS rates |

**Estimate:** Under $1/month at low usage.

### S3

| Dimension | Price (ap-south-1) |
|-----------|--------------------|
| Storage (Standard) | $0.025 per GB/month |
| PUT/POST requests | $0.005 per 1,000 |
| GET requests | $0.0004 per 1,000 |
| Data transfer out | $0.1093 per GB (first 10 TB) |

**Estimate:** Photos and videos are the primary cost driver. At ~1 GB stored, under $0.10/month.

### SNS

| Dimension | Price |
|-----------|-------|
| Mobile push (APNs/FCM) | $0.50 per million |
| SMS (India) | Varies by route |
| HTTP/S delivery | $0.60 per million |

**Estimate:** Push notifications are effectively free at low volume.

### Lambda (if added behind AppSync)

| Dimension | Price (ap-south-1) |
|-----------|--------------------|
| Requests | $0.20 per million |
| Duration | $0.0000133334 per GB-second |
| Free tier | 1M requests + 400,000 GB-seconds/month |

**Estimate:** Free tier covers early-stage usage entirely.

### EventBridge

| Dimension | Price |
|-----------|-------|
| Custom events | $1.00 per million |
| Scheduler invocations | $1.00 per million |
| Archive + replay | $0.10 per GB ingested |

**Estimate:** Under $0.01/month for reminders.

### Cognito

| Dimension | Price |
|-----------|-------|
| MAU (Monthly Active Users) | Free for first 50,000 MAU |
| SMS for OTP | Pass-through carrier cost |

**Estimate:** Free for first 50,000 users. SMS OTP cost depends on carrier rates in India.

### Total Estimated Monthly Cost

| Stage | Estimate | Notes |
|-------|----------|-------|
| dev | $0 - $2 | Minimal usage, free tier covers most services |
| prod (early, ~100 DAU) | $1 - $5 | DynamoDB + S3 storage dominate |
| prod (growth, ~10K DAU) | $20 - $100 | Media storage and data transfer become primary costs |

All estimates exclude SMS/OTP delivery charges and data transfer between regions.
