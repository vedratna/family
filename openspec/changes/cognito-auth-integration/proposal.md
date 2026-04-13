## Why

Local dev uses `x-user-id` header bypass — anyone can act as anyone. Production AppSync requires real Cognito auth (the API was deployed with `USER_POOL` as the default auth mode). The web app currently has no Cognito integration at all. This is the biggest single blocker for deploying the app to real users.

## What Changes

**Cognito setup (verify existing):**

- Confirm Cognito User Pool deployed (already in CDK auth-stack.ts)
- Confirm User Pool client config supports phone OTP and Google/Apple social (Apple is conditional in current stack)
- Document the hosted UI URL or app client config needed

**Web auth integration:**

- Replace LoginPage's local user list with real signup + sign-in flows:
  - Sign Up: phone number → Cognito sends OTP → enter OTP → user created in Cognito → call backend `register` to create User record (linking cognitoSub)
  - Sign In: phone number → OTP → Cognito returns JWT → store in localStorage
  - Social: button to redirect to Cognito hosted UI for Google/Apple (where configured)
- Update GraphQL client to send `Authorization: Bearer <jwt>` instead of `x-user-id`
- Token refresh: when JWT expires, use refresh token; if refresh fails, log out

**Backend changes:**

- Lambda handlers already use `event.identity.sub` (Cognito sub). Verify the register handler creates a User record with that exact sub.
- Local server keeps `x-user-id` for dev (gated by env var or detected when no Authorization header)
- Document the dev-vs-prod auth difference clearly

**E2E test compatibility:**

- E2E shell script keeps using `x-user-id` against local API
- Playwright tests (separate change) will use real Cognito flows

**Demo users in Cognito:**

- One-time setup script: create Mickey Mouse and Bart Simpson users in Cognito with known passwords for QA

## Capabilities

### New Capabilities

- `cognito-auth`: Real authentication flow using AWS Cognito with phone OTP, social login support, JWT-based session, refresh token rotation

### Modified Capabilities

- `local-auth`: Repurposed as dev-mode-only; production uses cognito-auth instead
- `graphql-client`: Auth exchange now sends Bearer JWT in production; falls back to x-user-id in dev

## Impact

- **New files**: `web/src/lib/auth/cognito-client.ts`, `web/src/lib/auth/jwt-storage.ts`, `web/src/pages/SignupPage.tsx` (separate from LoginPage now), OTP entry component
- **Modified files**: GraphQLProvider (auth header switching), AuthProvider (token + refresh), LoginPage (real flow)
- **Dependencies**: `@aws-sdk/client-cognito-identity-provider` or `amazon-cognito-identity-js`
- **Prerequisite**: `lambda-handler-name-resolution` (so AppSync returns enriched data once auth works)
- **Unblocks**: production deploy
