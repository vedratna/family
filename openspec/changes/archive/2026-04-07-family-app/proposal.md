## Why

Families today are fragmented across WhatsApp groups, shared photo albums, calendar apps, and social media platforms. There is no single, private space designed specifically for extended family coordination and connection. Existing solutions either focus on one aspect (photo sharing OR calendars) or are noisy social platforms not built for family privacy. Families need a unified, privacy-first app that combines social sharing, event planning, relationship mapping, and household coordination — without the noise of general-purpose social media.

## What Changes

- Introduce a new full-stack application (React Native mobile + AWS serverless backend)
- Users can create family groups, invite members by defining relationships (son, daughter, spouse, etc.)
- One user can belong to multiple families and switch between them
- Auto-generated family tree from bi-directional relationships with inference (e.g., parent + spouse → in-law)
- Social feed as the home page with time-ordered posts (text, photos, videos), reactions, and comments
- Upcoming event cards mixed into the social feed for visibility
- Shared family calendar with events for birthdays, marriages, exams, social functions
- Push notification system with per-member preferences (events/reminders ON by default)
- EventBridge-powered scheduled reminders (1 week, 1 day, day-of)
- Role-based access control: Owner, Admin, Editor, Viewer
- Cross-posting to external platforms via native OS share sheet
- Chore assignment and tracking with rotation support
- Person records can exist without app accounts (for tree completeness — e.g., deceased ancestors)

## Capabilities

### New Capabilities

- `user-auth`: User registration, login, session management via AWS Cognito. Multi-device support.
- `family-management`: Create families, invite/add members, assign roles (Owner/Admin/Editor/Viewer), multi-family switching.
- `member-relationships`: Define bi-directional relationships between family members with perspective-aware labels. Automatic relationship inference engine.
- `family-tree`: Auto-generated family tree visualization from defined relationships. Support for members without app accounts.
- `social-feed`: Time-ordered post feed (text, photos, videos) as the home page. Reactions, comments, and external sharing via native share sheet.
- `family-calendar`: Shared calendar for family events (birthdays, marriages, exams, functions). Recurring events and date blocking.
- `notifications`: Push notifications via SNS. Per-member notification preferences. EventBridge-scheduled reminders for upcoming events.
- `chores`: Family chore/task assignment, tracking, and rotation management.
- `media-storage`: Photo and video upload, storage (S3), and retrieval. Presigned URLs for secure access.

### Modified Capabilities

_(None — this is a greenfield project.)_

## Impact

- **New codebase**: React Native (Expo) mobile app, AWS serverless backend (API Gateway + Lambda)
- **AWS services**: Cognito, DynamoDB (single-table design, on-demand billing), S3, SNS, EventBridge
- **API**: New REST or GraphQL API serving both mobile and future web clients
- **Infrastructure**: Full AWS serverless stack to be provisioned (likely via CDK or SAM)
- **Dependencies**: Expo SDK, React Navigation, AWS SDK, push notification libraries
- **Future**: React web app (Phase 2) will consume the same backend API
