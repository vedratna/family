# Mobile Builds (Expo EAS)

## Build Profiles

| Profile       | Use                       | Distribution                           | Build Time |
| ------------- | ------------------------- | -------------------------------------- | ---------- |
| `development` | Local dev with dev client | Internal                               | ~10 min    |
| `preview`     | QA testing                | Internal (TestFlight / internal track) | ~15 min    |
| `production`  | App Store / Play Store    | Public                                 | ~15 min    |

## Commands

```bash
# Development build (includes dev tools)
cd packages/mobile
eas build --profile development --platform all

# Preview build (production-like, internal testing)
eas build --profile preview --platform all

# Production build (for store submission)
eas build --profile production --platform all
```

## App Store Submission

```bash
# iOS — submits to App Store Connect
eas submit --platform ios

# Android — submits to Google Play
eas submit --platform android
```

## Environment Variables per Profile

| Variable    | development | preview     | production   |
| ----------- | ----------- | ----------- | ------------ |
| `MOCK_MODE` | `true`      | `false`     | `false`      |
| `STAGE`     | `dev`       | `dev`       | `prod`       |
| `API_URL`   | localhost   | dev AppSync | prod AppSync |

API_URL for cloud environments is set via EAS secrets:

```bash
eas secret:create --scope project --name API_URL --value <appsync-url>
```
