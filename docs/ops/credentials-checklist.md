# Credentials Checklist

Complete inventory of all credentials needed, organized by when you need them.

## Credentials Matrix

| Credential                      | Stage Needed        | Where to Get              | Where to Store                             | Consumed By                 |
| ------------------------------- | ------------------- | ------------------------- | ------------------------------------------ | --------------------------- |
| **AWS IAM Access Key**          | Dev deploy+         | AWS IAM Console           | GitHub Secrets                             | GitHub Actions (CDK deploy) |
| **AWS IAM Secret Key**          | Dev deploy+         | AWS IAM Console           | GitHub Secrets                             | GitHub Actions (CDK deploy) |
| **CDK Bootstrap**               | Dev deploy+         | `cdk bootstrap` command   | N/A (one-time)                             | CDK                         |
| **Google OAuth Client ID**      | Dev with auth+      | Google Cloud Console      | CDK parameter                              | Cognito                     |
| **Google OAuth Client Secret**  | Dev with auth+      | Google Cloud Console      | SSM `/family/<stage>/google-client-secret` | Cognito                     |
| **Apple Service ID**            | Dev with auth+      | Apple Developer Portal    | CDK parameter                              | Cognito                     |
| **Apple Team ID**               | Dev with auth+      | Apple Developer Portal    | CDK parameter                              | Cognito                     |
| **Apple Key ID**                | Dev with auth+      | Apple Developer Portal    | CDK parameter                              | Cognito                     |
| **Apple Private Key**           | Dev with auth+      | Apple Developer Portal    | CDK parameter                              | Cognito                     |
| **APNs Certificate/Key**        | Dev with notifs+    | Apple Developer Portal    | SNS Platform App (manual)                  | SNS                         |
| **FCM Server Key**              | Dev with notifs+    | Firebase Console          | SNS Platform App (manual)                  | SNS                         |
| **Expo Token**                  | EAS builds          | expo.dev Account Settings | GitHub Secrets                             | EAS Build workflow          |
| **App Store Connect API Key**   | Prod app submission | App Store Connect         | GitHub Secrets                             | EAS Submit                  |
| **Google Play Service Account** | Prod app submission | Google Play Console       | GitHub Secrets                             | EAS Submit                  |

## Per-Stage Requirements

```
LOCAL (mock mode):    Nothing needed
LOCAL (API mode):     Nothing needed (DynamoDB Local, no AWS)
DEV deploy:           AWS IAM + CDK bootstrap
DEV with auth:        + Google OAuth + Apple Sign In + SNS SMS sandbox exit
DEV with notifs:      + APNs certificate + FCM key
PROD:                 All of the above + Expo token + App Store/Play credentials
```

## Setup Order (Recommended)

1. **AWS Account** → [aws-bootstrap.md](aws-bootstrap.md)
2. **GitHub Repo** → [github-setup.md](github-setup.md)
3. **First deploy to dev** (auth providers not needed yet)
4. **Google OAuth** → Google Cloud Console
5. **Apple Sign In** → Apple Developer Portal ($99/year)
6. **Exit SNS SMS sandbox** → AWS Console
7. **Push notifications** → APNs + FCM setup
8. **Expo EAS** → expo.dev signup
9. **App Store / Play Store** → When ready for public release
