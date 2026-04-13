## 1. Web Dependencies

- [ ] 1.1 Install `amazon-cognito-identity-js` in web package
- [ ] 1.2 Add Vite env vars: `VITE_AUTH_MODE`, `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID`, `VITE_COGNITO_REGION` to `.env.example`

## 2. Cognito Client Wrapper

- [ ] 2.1 Create `web/src/lib/auth/cognito-client.ts`:
  - `signUp(phone, displayName)` → triggers Cognito signup + SMS OTP
  - `confirmSignUp(phone, otp)` → confirms registration
  - `signIn(phone)` → returns tokens
  - `refreshTokens(refreshToken)` → returns new tokens
  - `signOut()` → clears Cognito session
- [ ] 2.2 Create `web/src/lib/auth/jwt-storage.ts` for localStorage persistence with token expiry helpers
- [ ] 2.3 Create `web/src/lib/auth/derive-password.ts` — deterministic password from phone (SHA256 + secret)

## 3. AuthProvider Refactor

- [ ] 3.1 Update AuthProvider to support both local and cognito modes (read VITE_AUTH_MODE)
- [ ] 3.2 In Cognito mode, store full token bundle (idToken, accessToken, refreshToken, expiresAt) instead of just user object
- [ ] 3.3 Expose `getValidIdToken(): Promise<string>` that refreshes if expired

## 4. GraphQLProvider Updated

- [ ] 4.1 In Cognito mode, auth exchange adds `Authorization: Bearer <idToken>` instead of `x-user-id`
- [ ] 4.2 On 401/auth error, attempt refresh; if refresh fails, log out

## 5. LoginPage Multi-Step Flow

- [ ] 5.1 Refactor LoginPage to delegate to mode-specific subcomponents
- [ ] 5.2 Create `CognitoSignUpFlow` — phone entry → OTP entry → backend register call → success
- [ ] 5.3 Create `CognitoSignInFlow` — phone entry → token retrieval → success
- [ ] 5.4 Map Cognito error codes via `formatErrorMessage` (UserNotFoundException → "An account with this phone does not exist", CodeMismatchException → "Wrong code", etc.)

## 6. Demo Users Setup Script

- [ ] 6.1 Create `scripts/cognito-seed-demo-users.sh` — uses AWS CLI to create Mickey + Bart Cognito users with auto-confirmed phone
- [ ] 6.2 Document in ops doc how to run after first deploy

## 7. Documentation

- [ ] 7.1 Update README with Cognito setup steps
- [ ] 7.2 Update credentials-per-stage.md with Cognito IDs requirement
- [ ] 7.3 Update local-dev docs to mention VITE_AUTH_MODE

## 8. Verification

- [ ] 8.1 Lint, typecheck, all tests pass
- [ ] 8.2 e2e-test.sh still passes (local mode unchanged)
- [ ] 8.3 Manual: with VITE_AUTH_MODE=local, app works as before
- [ ] 8.4 Manual: with VITE_AUTH_MODE=cognito + valid Cognito IDs, signup with phone works (requires deployed Cognito)
