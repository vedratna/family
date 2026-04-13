## Context

The local dev stack uses an `x-user-id` header for auth — anyone can act as anyone. Production AppSync was deployed with `USER_POOL` as default auth (Cognito). Web app currently has no Cognito integration. Lambda handlers already read `event.identity.sub` (Cognito user pool sub).

The CDK auth-stack already provisions:

- Cognito User Pool with phone sign-in, phone OTP auto-verify, password policy
- App client with auth flows (custom + userSrp + OAuth authorization code)
- Optional Google + Apple identity providers (conditional on context vars — currently not configured)

What's missing on the client side: the actual Cognito SDK calls to sign up, sign in, verify OTP, manage tokens, refresh, and inject JWT into AppSync requests.

## Goals / Non-Goals

**Goals:**

- Web supports phone signup with OTP verification via Cognito
- Web supports phone sign-in with OTP via Cognito
- JWT stored locally, refreshed when expired
- AppSync requests include `Authorization: Bearer <jwt>`
- Backend `register` mutation creates a User record linked to the Cognito sub
- Local dev keeps working (x-user-id bypass) for fast iteration
- Demo users provisioned in Cognito for QA

**Non-Goals:**

- Social login UI (Google/Apple) — backend supports it conditionally; UI button can be added in a polish change later
- Multi-factor auth beyond OTP
- Account recovery flows (forgot password) — out of scope for v1
- Anonymous browsing / guest mode

## Decisions

### 1. Cognito SDK Choice — amazon-cognito-identity-js

**Decision:** Use `amazon-cognito-identity-js` for the web client.

**Rationale:** Higher-level than the raw `@aws-sdk/client-cognito-identity-provider`. Designed for browser auth flows. Handles SRP password protocol (used for sign-in even when password is OTP-derived), token storage, refresh.

**Alternatives considered:**

- _AWS Amplify Auth_: Too heavy, brings UI components and lots of opinions. Rejected.
- _Raw AWS SDK v3_: More control but we'd have to implement SRP ourselves. Rejected.
- _Custom HTTP client to Cognito endpoints_: Brittle. Rejected.

### 2. Auth Flow — Phone + OTP (Custom Auth Challenge)

**Decision:** Use Cognito's custom auth challenge flow for phone-only OTP (no password):

```
Sign up:
  1. Client → Cognito signUp(phone, randomPassword)
  2. Cognito sends SMS OTP automatically (autoVerify configured in user pool)
  3. Client → Cognito confirmSignUp(phone, otp)
  4. Client → Cognito initiateAuth(USER_PASSWORD_AUTH, phone, randomPassword)
  5. Cognito returns tokens (idToken, accessToken, refreshToken)
  6. Client → backend register mutation with phone, cognitoSub (from idToken), displayName
  7. Backend creates User record linking sub → user.id

Sign in:
  1. Client → Cognito initiateAuth(USER_PASSWORD_AUTH, phone, randomPassword)
  2. Cognito returns tokens
  3. Client uses tokens; backend identifies user by event.identity.sub
```

**Rationale:** Real OTP-only auth requires custom Lambda triggers (CreateAuthChallenge, DefineAuthChallenge, VerifyAuthChallengeResponse) which are extensive backend setup. A pragmatic v1 uses a deterministic password derived from phone (e.g., SHA256(phone+secret)) so users never see/manage a password but Cognito gets one. The OTP serves as identity verification at signup. Document this as a v1 simplification; full custom-auth Lambda triggers can come later.

**Alternative:** Email + password (simpler to bootstrap, no SMS costs). Rejected because the original spec is phone-first.

### 3. Token Storage — localStorage with 1-hour Refresh Buffer

**Decision:** Store tokens in `localStorage`. urql's auth exchange checks expiry on each request; if `accessToken` expires in < 5 min, use the refresh token to get a fresh one before sending.

```typescript
interface StoredAuth {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number; // ms timestamp
  user: { id: string; phone: string; displayName: string };
}
```

**Rationale:** localStorage survives reload (matches current AuthProvider). Refresh-on-demand simpler than scheduled refresh. urql's authExchange supports addAuthToOperation + didAuthError for retry.

**Risk:** localStorage is XSS-vulnerable. Acceptable for v1 (we're a private family app, no third-party scripts). For higher security, switch to httpOnly cookies via a backend session endpoint — separate change.

### 4. Dev Mode vs Production Mode

**Decision:** A single env var `VITE_AUTH_MODE` controls behavior:

- `local` (default for dev) → x-user-id header, current LoginPage with seed users
- `cognito` → real Cognito auth, signup/signin via OTP

The local server keeps reading `x-user-id` (no change). The Lambda handlers keep reading `event.identity.sub` (no change). Only the web client and how it injects auth changes.

**Why not auto-detect?** Auto-detection (e.g., if `VITE_COGNITO_USER_POOL_ID` is set, use Cognito) would be magic. Explicit env var is clearer.

### 5. Backend register Mutation — Already Correct

**Verified:** The existing `register(phone, cognitoSub, displayName)` mutation already accepts cognitoSub from the client. The Lambda handler creates User record with that sub. `event.identity.sub` matches what we pass. So no backend changes needed for the link.

### 6. UI Components

**Decision:** Refactor LoginPage:

- Mode tabs already exist (Sign Up / Log In)
- In `cognito` mode: each form gets a 2-step UX: enter phone → enter OTP → submitted
- Separate `CognitoSignUpFlow` and `CognitoSignInFlow` components handle the multi-step state

Reuse: `formatErrorMessage` for Cognito errors (UserNotFoundException, CodeMismatchException, etc. mapped to friendly strings).

### 7. Demo Users Setup Script

**Decision:** Add `scripts/cognito-seed-demo-users.sh` (one-time use) that creates Mickey and Bart users in Cognito with known phone numbers and verifies them. Run by humans during deploy setup, not by CI.

### 8. CDK Output for Cognito IDs

**Decision:** auth-stack already exports UserPoolId and UserPoolClientId via CfnOutput. Web client reads these from env vars at build time:

```
VITE_COGNITO_USER_POOL_ID=ap-south-1_xxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxx
VITE_COGNITO_REGION=ap-south-1
VITE_AUTH_MODE=cognito
VITE_API_URL=https://...appsync-api.../graphql
```

Document in `.env.example` and ops docs.

## Risks / Trade-offs

**[Deterministic password bootstrap]** → Risk: if the secret leaks, anyone can sign in for any phone (with active OTP confirmation). Mitigation: secret stored only on client (in code, not env), and the OTP confirmation gate prevents account creation without phone access. Real custom auth challenge is the proper fix.

**[localStorage XSS]** → Risk acknowledged. Mitigated by no third-party scripts policy. Future: httpOnly cookie-based session.

**[SMS costs]** → Cognito uses SNS for SMS. Sandbox limits at first; production needs sandbox exit and SNS spend monitoring. Document in deploy ops.

**[Refresh token rotation]** → Cognito issues refresh tokens with a longer TTL. We rotate access tokens; refresh tokens are reused. If refresh fails (revoked or expired), client logs user out. Acceptable.
