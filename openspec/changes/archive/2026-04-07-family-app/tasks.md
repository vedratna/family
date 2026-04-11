## 1. Monorepo Scaffold & Quality Infrastructure (Commit Zero)

- [x] 1.1 Initialize Turborepo monorepo with npm/pnpm workspaces (packages: shared, backend, mobile, infra)
- [x] 1.2 Configure shared tsconfig.base.json with strict mode (strict, noUncheckedIndexedAccess, noImplicitReturns, noFallthroughCasesInSwitch, forceConsistentCasingInFileNames)
- [x] 1.3 Configure ESLint with TypeScript rules: no-explicit-any, no-floating-promises, strict-boolean-expressions, no-unused-vars (error), no-unnecessary-condition, no-redundant-type-constituents, no-useless-constructor, no-else-return, no-unreachable, import/no-cycle
- [x] 1.4 Configure eslint-plugin-boundaries to enforce architecture layers (handlers cannot import domain, screens cannot import repositories, domain imports nothing external)
- [x] 1.5 Configure Prettier for consistent formatting across all packages
- [x] 1.6 Set up Husky + lint-staged: pre-commit runs ESLint and Prettier on staged files
- [x] 1.7 Set up commitlint with conventional commit config
- [x] 1.8 Initialize packages/shared with types/, validation/ (Zod), and constants/ directories
- [x] 1.9 Initialize packages/backend with clean architecture folder structure: domain/models, domain/errors, use-cases/, repositories/interfaces, repositories/dynamodb, handlers/, shared/middleware, shared/validation
- [x] 1.10 Initialize packages/mobile with Expo (React Native) TypeScript template
- [x] 1.11 Configure mobile feature-based folder structure: features/, shared/components, shared/hooks, shared/theme, shared/navigation, providers/
- [x] 1.12 Initialize packages/infra with AWS CDK TypeScript template
- [x] 1.13 Configure Vitest for backend and shared packages with coverage thresholds (80% minimum, 100% for use-cases/)
- [x] 1.14 Configure React Native Testing Library and Vitest for mobile package
- [x] 1.15 Set up GitHub Actions CI pipeline: lint, typecheck, unit tests, build check, bundle size check, security audit
- [x] 1.16 Set up GitHub Actions PR checks: all 7 gates must pass before merge
- [x] 1.17 Set up TanStack Query provider in mobile with default config (stale time, retry, refetch settings)
- [x] 1.18 Verify full pipeline: create a dummy test, commit, push, confirm all CI gates run and pass

## 2. Theming System & Design Tokens

- [x] 2.1 Create base color palette in shared/theme/colors/base.ts (warm neutral backgrounds, text colors, semantic colors for both light and dark mode)
- [x] 2.2 Create 8 accent theme definitions in shared/theme/colors/themes.ts (Teal, Indigo, Coral, Sage, Amber, Ocean, Plum, Slate — each with primary, dark, light, onColor values)
- [x] 2.3 Create dark mode color mappings in shared/theme/colors/dark-mode.ts (warm dark backgrounds, adjusted accent brightening per theme)
- [x] 2.4 Create typography tokens in shared/theme/typography.ts (system font, 16px base minimum, line height 1.5x, Dynamic Type scale factor support)
- [x] 2.5 Create spacing tokens in shared/theme/spacing.ts (8px grid: xs=4, sm=8, md=16, lg=24, xl=32, xxl=48)
- [x] 2.6 Create border radius tokens in shared/theme/radius.ts (sm=8, md=12, lg=16, xl=24, full=9999)
- [x] 2.7 Create shadow tokens in shared/theme/shadows.ts (subtle elevation for light mode, border-based for dark mode)
- [x] 2.8 Create useTheme() hook that resolves active family's accent color + user's dark mode preference into a complete theme object
- [x] 2.9 Create ThemeProvider context that wraps the app and supplies theme to all components
- [x] 2.10 Create dark mode preference setting (Light / Dark / System) stored per-user
- [x] 2.11 Validate WCAG AAA contrast ratios for all theme + text combinations
- [x] 2.12 Test theme at 1x, 1.5x, and 2x Dynamic Type scale

## 3. AWS Infrastructure (CDK)

- [x] 3.1 Define CDK stack: Cognito User Pool with phone number auth and Google/Apple social providers
- [x] 3.2 Define CDK stack: DynamoDB table (single-table design) with on-demand billing and GSIs
- [x] 3.3 Define CDK stack: S3 bucket for media storage with CORS configuration
- [x] 3.4 Define CDK stack: AppSync GraphQL API with Cognito authorizer
- [x] 3.5 Define CDK stack: SNS platform applications for iOS and Android push notifications
- [x] 3.6 Define CDK stack: EventBridge rules infrastructure for scheduled reminders
- [x] 3.7 Deploy initial infrastructure to AWS dev environment

## 4. DynamoDB Single-Table Design

- [x] 4.1 Document all access patterns and key schema design
- [x] 4.2 Define primary key schema (PK/SK) for all entity types: User, Family, Person, Membership, Relationship, Post, PostMedia, Reaction, Comment, Event, EventRSVP, Chore, NotificationPreference, DeviceToken
- [x] 4.3 Define GSI1 for reverse lookups (e.g., all relationships for a person, all posts by a user)
- [x] 4.4 Define GSI2 for cross-entity queries (e.g., user's families, events by date range)
- [x] 4.5 Create shared DynamoDB utility layer in backend/repositories/dynamodb (put, get, query, batch operations, key builders)
- [x] 4.6 Create TypeScript types/interfaces for all entity items with PK/SK patterns in shared/types
- [x] 4.7 Create Zod validation schemas for all input types in shared/validation
- [x] 4.8 Write seed data script for local development (DynamoDB Local)
- [x] 4.9 Set up DynamoDB Local in Docker for development and integration testing
- [x] 4.10 Write integration tests for DynamoDB utility layer against DynamoDB Local

## 5. Authentication (user-auth)

- [x] 5.1 Create domain models: User, AuthToken types in shared/types
- [x] 5.2 Create use case: registerWithPhone (business logic, calls repository interface)
- [x] 5.3 Create use case: verifyOtp (validates OTP, creates user record)
- [x] 5.4 Create use case: loginWithPhone (validates credentials, returns tokens)
- [x] 5.5 Create use case: socialLogin (Google/Apple, creates or links user)
- [x] 5.6 Create use case: updateUserProfile (display name, profile photo, DOB)
- [x] 5.7 Create repository interface: IUserRepository
- [x] 5.8 Create DynamoDB repository implementation: DynamoUserRepository
- [x] 5.9 Create AppSync resolvers / Lambda handlers: thin wrappers calling use cases
- [x] 5.10 Write unit tests for all auth use cases (mocked repositories)
- [x] 5.11 Write integration tests for DynamoUserRepository against DynamoDB Local
- [x] 5.12 Implement mobile auth screens: phone number entry, OTP verification (auto-advance on complete)
- [x] 5.13 Implement mobile auth screens: social login buttons (Google, Apple)
- [x] 5.14 Implement secure token storage on device (Expo SecureStore)
- [x] 5.15 Implement authenticated API client with token refresh (TanStack Query + AppSync)
- [x] 5.16 Write component tests for auth screens

## 6. Onboarding Flow

- [x] 6.1 Implement mobile welcome screen: hero illustration (Open Peeps), sign-up options (phone, Google, Apple)
- [x] 6.2 Implement mobile profile setup screen: name, optional photo (Open Peeps default avatar tinted with accent), optional DOB with "helps us remind your family!" nudge
- [x] 6.3 Implement mobile create family screen: family name input, theme color picker with live preview of accent color
- [x] 6.4 Implement mobile invite members screen: pre-populated 2 invite slots (name, phone, relationship dropdown), "Add another" expandable, "I'll do this later" de-emphasized
- [x] 6.5 Implement invite SMS deep link generation and handling (https://family.app/invite/<code>)
- [x] 6.6 Implement invitee landing screen: shows inviter name, family name, pre-filled relationship, single "Join Family" CTA
- [x] 6.7 Implement invitee mini-tour overlay: 3-step (Feed, Calendar+Tree, Notifications), skippable, does not repeat
- [x] 6.8 Implement activation gate on feed: locked state UI with "Waiting for your family to join" illustration, pending invite status, "Invite More Family" CTA, "While you wait" suggestions
- [x] 6.9 Implement system-generated welcome post on family creation (not deletable)
- [x] 6.10 Implement activation gate backend: block post/comment creation if family has < 2 active members with app accounts
- [x] 6.11 Implement persistent "Invite Family" button in header until 2+ members with app accounts have joined
- [x] 6.12 Implement dismissable setup checklist card on feed for definer (Create family, Invite members, Add event, Share first post, Complete tree)
- [x] 6.13 Implement re-engagement notifications: schedule EventBridge rules at +24h, +1w, +1m after family creation if no member has joined
- [x] 6.14 Implement re-engagement cancellation: cancel all pending re-engagement notifications when first member joins
- [x] 6.15 Write unit tests for activation gate use case and re-engagement scheduling
- [x] 6.16 Write component tests for all onboarding screens and tour overlay

## 7. Family Management (family-management)

- [x] 7.1 Create domain models: Family, Person, FamilyMembership, Role types in shared/types
- [x] 7.2 Create domain errors: PermissionDeniedError, FamilyNotFoundError, MemberNotFoundError
- [x] 7.3 Create Zod schemas: CreateFamilyInput, InviteMemberInput, UpdateRoleInput in shared/validation
- [x] 7.4 Create repository interface: IFamilyRepository, IPersonRepository, IMembershipRepository
- [x] 7.5 Create use case: createFamily (creates family + owner membership + person record + default theme)
- [x] 7.6 Create use case: inviteMember (permission check, create pending membership, return invite)
- [x] 7.7 Create use case: acceptInvitation (activate membership, create relationships)
- [x] 7.8 Create use case: addNonAppPerson (create Person without user account)
- [x] 7.9 Create use case: updateMemberRole (permission check: Owner/Admin only)
- [x] 7.10 Create use case: transferOwnership
- [x] 7.11 Create use case: removeMember (preserves Person record and relationships)
- [x] 7.12 Create use case: getUserFamilies (for family switcher)
- [x] 7.13 Create use case: updateFamilyTheme (Owner/Admin only, select from 8 themes)
- [x] 7.14 Create DynamoDB repository implementations for family, person, membership
- [x] 7.15 Create AppSync schema: Family type, mutations, queries
- [x] 7.16 Create Lambda handlers: thin wrappers with Zod validation calling use cases
- [x] 7.17 Write unit tests for all family management use cases
- [x] 7.18 Write integration tests for family DynamoDB repositories
- [x] 7.19 Implement mobile screen: family switcher (list families with accent color indicators, switch active family)
- [x] 7.20 Implement mobile screen: create family form (with theme color picker)
- [x] 7.21 Implement mobile screen: family members list with roles
- [x] 7.22 Implement mobile screen: invite member form (phone, relationship, role)
- [x] 7.23 Implement mobile screen: manage member (change role, remove)
- [x] 7.24 Implement mobile screen: family settings (change theme, manage family)
- [x] 7.25 Write component tests for family management screens

## 8. Member Relationships (member-relationships)

- [x] 8.1 Create domain models: Relationship, RelationshipType, InferredRelationship types in shared/types
- [x] 8.2 Create Zod schemas: CreateRelationshipInput, EditRelationshipInput in shared/validation
- [x] 8.3 Create repository interface: IRelationshipRepository
- [x] 8.4 Create use case: createRelationship (store bi-directional labels, validate permissions)
- [x] 8.5 Create use case: getRelationships (perspective-aware — return labels relative to requesting user)
- [x] 8.6 Create use case: editRelationship, deleteRelationship
- [x] 8.7 Create use case: inferRelationships (triggered on relationship create/update, returns pending suggestions)
- [x] 8.8 Implement inference rules: parent-child → grandparent, spouse → in-law, sibling → uncle/aunt, cousin
- [x] 8.9 Create use case: confirmInference, rejectInference
- [x] 8.10 Create DynamoDB repository implementation for relationships
- [x] 8.11 Create AppSync schema and Lambda handlers for relationships
- [x] 8.12 Write unit tests for all relationship use cases (especially inference engine — exhaustive test cases)
- [x] 8.13 Write integration tests for relationship DynamoDB repository
- [x] 8.14 Implement mobile screen: add relationship form (select two persons, define labels and type)
- [x] 8.15 Implement mobile screen: view relationships for a person (perspective-aware labels)
- [x] 8.16 Implement mobile screen: pending relationship suggestions with confirm/reject
- [x] 8.17 Write component tests for relationship screens

## 9. Family Tree (family-tree)

- [x] 9.1 Create use case: buildFamilyTree (fetch all relationships, build graph in-memory, return tree structure)
- [x] 9.2 Implement tree cache: store computed tree in DynamoDB, invalidate on relationship changes
- [x] 9.3 Create AppSync query: familyTree (returns all persons and relationships for tree rendering)
- [x] 9.4 Create Lambda handler for tree query
- [x] 9.5 Write unit tests for tree building algorithm (multiple root nodes, complex families, edge cases)
- [x] 9.6 Implement mobile tree visualization component (support multiple root nodes)
- [x] 9.7 Implement generational layout algorithm (position persons by generation level)
- [x] 9.8 Implement tree interaction: tap person to view profile card
- [x] 9.9 Implement visual distinction for non-app members (greyed out or different styling)
- [x] 9.10 Implement pinch-to-zoom and pan for large trees
- [x] 9.11 Write component tests for tree visualization

## 10. Social Feed (social-feed)

- [x] 10.1 Create domain models: Post, Comment, Reaction types in shared/types
- [x] 10.2 Create Zod schemas: CreatePostInput, AddCommentInput, AddReactionInput in shared/validation
- [x] 10.3 Create repository interface: IPostRepository, ICommentRepository, IReactionRepository
- [x] 10.4 Create use case: createPost (permission check + activation gate check, store text, associate media)
- [x] 10.5 Create use case: getFamilyFeed (time-ordered, cursor-based pagination, include author info)
- [x] 10.6 Create use case: addReaction, removeReaction
- [x] 10.7 Create use case: addComment, getPostComments (paginated, activation gate check)
- [x] 10.8 Create use case: deletePost (author or Admin/Owner permission check)
- [x] 10.9 Create DynamoDB repository implementations for posts, comments, reactions
- [x] 10.10 Create AppSync schema and Lambda handlers for feed
- [x] 10.11 Write unit tests for all feed use cases (including activation gate scenarios)
- [x] 10.12 Write integration tests for feed DynamoDB repositories
- [x] 10.13 Implement mobile home screen: feed with FlatList infinite scroll
- [x] 10.14 Implement mobile component: post card (text, media gallery, reactions, comment preview)
- [x] 10.15 Implement mobile screen: create post (text input, photo/video picker)
- [x] 10.16 Implement mobile component: reactions bar (add/remove emoji reactions)
- [x] 10.17 Implement mobile screen: comments view (full comment list for a post)
- [x] 10.18 Implement native share sheet integration for sharing posts externally
- [x] 10.19 Implement upcoming event cards inserted into feed (query events within 7 days)
- [x] 10.20 Write component tests for feed screens and components

## 11. Family Calendar (family-calendar)

- [x] 11.1 Create domain models: Event, EventRSVP, EventType types in shared/types
- [x] 11.2 Create Zod schemas: CreateEventInput, EditEventInput, RSVPInput in shared/validation
- [x] 11.3 Create repository interface: IEventRepository
- [x] 11.4 Create use case: createEvent (permission check, store event, schedule reminders)
- [x] 11.5 Create use case: editEvent, deleteEvent (cancel associated reminders)
- [x] 11.6 Create use case: getFamilyEvents (filter by date range and event type)
- [x] 11.7 Create use case: rsvpEvent (going/maybe/not_going)
- [x] 11.8 Implement recurring event logic (annually recurring birthdays/anniversaries)
- [x] 11.9 Create DynamoDB repository implementation for events
- [x] 11.10 Create AppSync schema and Lambda handlers for calendar
- [x] 11.11 Write unit tests for all calendar use cases
- [x] 11.12 Write integration tests for event DynamoDB repository
- [x] 11.13 Implement mobile screen: calendar month view with event indicators
- [x] 11.14 Implement mobile screen: calendar agenda/list view
- [x] 11.15 Implement mobile screen: create/edit event form
- [x] 11.16 Implement mobile screen: event detail with RSVP buttons and attendee list
- [x] 11.17 Write component tests for calendar screens

## 12. Notifications (notifications)

- [x] 12.1 Create domain models: NotificationPreference, DeviceToken types in shared/types
- [x] 12.2 Create repository interface: INotificationPreferenceRepository, IDeviceTokenRepository
- [x] 12.3 Create use case: registerDeviceToken
- [x] 12.4 Create use case: getNotificationPreferences, updateNotificationPreference
- [x] 12.5 Create use case: sendPushNotification (check preferences, resolve device tokens)
- [x] 12.6 Create use case: processEventReminder (triggered by EventBridge, check preferences, send)
- [x] 12.7 Set default notification preferences on member join (events ON, social OFF, updates OFF)
- [x] 12.8 Create DynamoDB repository implementations for notification preferences and device tokens
- [x] 12.9 Implement Expo push notification registration (get device tokens on login)
- [x] 12.10 Create EventBridge scheduled rules when events are created (7 days, 1 day, day-of)
- [x] 12.11 Implement cancellation of EventBridge rules when events are deleted
- [x] 12.12 Create AppSync schema and Lambda handlers for notification preferences
- [x] 12.13 Write unit tests for notification use cases
- [x] 12.14 Write integration tests for notification DynamoDB repositories
- [x] 12.15 Implement mobile screen: notification preferences settings
- [x] 12.16 Implement notification triggers for: new post (if opted in), comment on own post, new member added
- [x] 12.17 Write component tests for notification settings screen

## 13. Media Storage (media-storage)

- [x] 13.1 Create domain models: Media, MediaType types in shared/types
- [x] 13.2 Create Zod schemas: RequestUploadInput (validate file type, size) in shared/validation
- [x] 13.3 Create repository interface: IMediaRepository
- [x] 13.4 Create use case: generatePresignedUploadUrl (validate file type, return S3 presigned URL)
- [x] 13.5 Create use case: confirmMediaUpload (store metadata after successful upload)
- [x] 13.6 Create use case: generatePresignedDownloadUrl (verify family membership, return signed URL)
- [x] 13.7 Create DynamoDB repository implementation for media metadata
- [x] 13.8 Create Lambda handlers for media operations
- [x] 13.9 Write unit tests for media use cases
- [x] 13.10 Add file type validation (JPEG, PNG, GIF, HEIC, MP4, MOV only)
- [x] 13.11 Implement mobile media picker integration (photo library, camera, video)
- [x] 13.12 Implement client-side upload flow (request URL → upload to S3 → confirm with backend)
- [x] 13.13 Implement media display components (image viewer, video player with signed URLs)
- [x] 13.14 Write component tests for media components

## 14. Chores (chores)

- [x] 14.1 Create domain models: Chore, ChoreStatus types in shared/types
- [x] 14.2 Create Zod schemas: CreateChoreInput, CompleteChoreInput in shared/validation
- [x] 14.3 Create repository interface: IChoreRepository
- [x] 14.4 Create use case: createChore (assign to member, set due date/recurrence)
- [x] 14.5 Create use case: completeChore (mark completed with timestamp)
- [x] 14.6 Create use case: getFamilyChores (filter by assignee, status)
- [x] 14.7 Implement chore rotation use case (triggered on schedule, reassign to next member)
- [x] 14.8 Implement recurring chore creation (create new instance on recurrence schedule)
- [x] 14.9 Create DynamoDB repository implementation for chores
- [x] 14.10 Create AppSync schema and Lambda handlers for chores
- [x] 14.11 Write unit tests for all chore use cases
- [x] 14.12 Write integration tests for chore DynamoDB repository
- [x] 14.13 Implement mobile screen: chore list (filterable by assignee, status)
- [x] 14.14 Implement mobile screen: create/edit chore form
- [x] 14.15 Write component tests for chore screens

## 15. Illustrations & Empty States

- [x] 15.1 Source Open Peeps illustration assets (welcome, family group, waiting, default avatar)
- [x] 15.2 Source unDraw illustration assets (empty feed, empty calendar, empty chores, error, offline)
- [x] 15.3 Implement illustration component with accent color tinting (adapts to active family theme)
- [x] 15.4 Implement empty state components for: feed, calendar, chore list, tree, notifications
- [x] 15.5 Implement Open Peeps default avatar component (used before photo upload, tinted with accent)
- [x] 15.6 Write component tests for illustration and empty state components

## 16. Navigation & App Shell

- [x] 16.1 Implement bottom tab navigation (Feed, Calendar, Tree, Chores, More)
- [x] 16.2 Implement family switcher in app header with accent color indicators per family
- [x] 16.3 Implement smooth accent color transition when switching families
- [x] 16.4 Implement "More" tab (profile, notification settings, family settings, dark mode toggle, logout)
- [x] 16.5 Implement app-wide loading and error states (shared error boundary component)
- [x] 16.6 Implement pull-to-refresh on feed and calendar screens
- [x] 16.7 Write navigation integration tests

## 17. E2E Tests & Final Quality Pass

- [x] 17.1 Set up Detox for E2E mobile testing
- [x] 17.2 Write E2E test: register → create family → pick theme → invite member → locked feed state
- [x] 17.3 Write E2E test: invitee accepts → mini-tour → feed unlocked → create post
- [x] 17.4 Write E2E test: login → switch family → verify theme color changes
- [x] 17.5 Write E2E test: create event → verify reminder notification
- [x] 17.6 Write E2E test: dark mode toggle → verify all screens render correctly
- [x] 17.7 Run full CI pipeline and verify all quality gates pass
- [x] 17.8 Verify test coverage meets thresholds: 80% overall, 100% on use-cases/
- [x] 17.9 Run security audit (npm audit) and resolve any vulnerabilities
