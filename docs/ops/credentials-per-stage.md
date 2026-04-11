# Credentials Per Stage

Minimum credentials needed at each development stage. Start with mock mode (zero setup) and add credentials as you progress.

## Stage 1: Local with Mock Data

**Credentials needed: None**

```bash
npm install
npm run dev:mobile
```

Everything runs locally with hardcoded mock data. No backend, no AWS, no accounts.

## Stage 2: Local with API

**Credentials needed: None**

```bash
npm run dev
```

Runs DynamoDB Local (Docker), Express + Apollo Server, and Expo. All local, no cloud accounts needed. Docker must be running.

## Stage 3: Deploy to Dev (Infrastructure Only)

**Credentials needed:**

| Credential | Where to Get | Where to Store |
|------------|--------------|----------------|
| AWS IAM Access Key ID | AWS IAM Console | GitHub Secret: `AWS_ACCESS_KEY_ID` |
| AWS IAM Secret Access Key | AWS IAM Console | GitHub Secret: `AWS_SECRET_ACCESS_KEY` |
| CDK Bootstrap | Run `cdk bootstrap` once | N/A (one-time setup) |

At this stage, the app deploys but auth (Cognito) has no social providers configured. Users can't sign in yet.

See [aws-bootstrap.md](aws-bootstrap.md) for step-by-step AWS setup.

## Stage 4: Dev with Authentication

**Additional credentials needed:**

| Credential | Where to Get | Where to Store |
|------------|--------------|----------------|
| Google OAuth Client ID | Google Cloud Console | CDK context parameter |
| Google OAuth Client Secret | Google Cloud Console | SSM: `/family/dev/google-client-secret` |
| Apple Service ID | Apple Developer Portal | CDK context parameter |
| Apple Team ID | Apple Developer Portal | CDK context parameter |
| Apple Key ID | Apple Developer Portal | CDK context parameter |
| Apple Private Key (.p8) | Apple Developer Portal | CDK context parameter |

After adding these, redeploy. Users can now sign in with Google or Apple.

## Stage 5: Dev with Push Notifications

**Additional credentials needed:**

| Credential | Where to Get | Where to Store |
|------------|--------------|----------------|
| APNs Certificate/Key | Apple Developer Portal | SNS Platform Application (manual) |
| FCM Server Key | Firebase Console | SNS Platform Application (manual) |

Also requires exiting the SNS SMS sandbox (AWS Console → SNS → Text messaging).

## Stage 6: Production

**Additional credentials needed:**

| Credential | Where to Get | Where to Store |
|------------|--------------|----------------|
| Expo Token | expo.dev Account Settings | GitHub Secret: `EXPO_TOKEN` |
| App Store Connect API Key | App Store Connect | GitHub Secret (for EAS Submit) |
| Google Play Service Account JSON | Google Play Console | GitHub Secret (for EAS Submit) |

Production also requires:
- All Stage 3–5 credentials duplicated for the `prod` stage (separate SSM params: `/family/prod/*`)
- GitHub environment `production` with required reviewers configured
- App Store / Google Play developer accounts ($99/year and $25 one-time)

## Quick Reference

```
Mock mode  → Zero credentials
Local API  → Zero credentials (just Docker)
Dev deploy → AWS IAM + CDK bootstrap
Dev auth   → + Google OAuth + Apple Sign In
Dev notifs → + APNs + FCM
Production → + Expo + App Store + Play Store
```
