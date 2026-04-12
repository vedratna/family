## 1. Extend GraphQL Schema

- [x] 1.1 Add feed types and operations: `Post`, `PaginatedPosts`, `FeedComment`, `PaginatedComments`, `Reaction` types + `familyFeed` query + `createPost`, `deletePost`, `addReaction`, `removeReaction`, `addComment` mutations
- [x] 1.2 Add calendar types and operations: `Event`, `EventRSVP`, `EventDetail` types + `familyEvents`, `eventDetail` queries + `createEvent`, `editEvent`, `deleteEvent`, `rsvpEvent` mutations
- [x] 1.3 Add chore types and operations: `Chore` type + `familyChores` query + `createChore`, `completeChore`, `rotateChore` mutations
- [x] 1.4 Add relationship and tree types and operations: `Relationship`, `FamilyTree`, `TreeNode` types + `familyRelationships`, `familyTree` queries + `createRelationship`, `editRelationship`, `deleteRelationship`, `confirmInference`, `rejectInference` mutations
- [x] 1.5 Add notification types and operations: `NotificationPreference` type + `notificationPreferences` query + `updateNotificationPreference`, `registerDeviceToken` mutations
- [x] 1.6 Add media operations: `UploadUrlResult` type + `generateUploadUrl`, `confirmMediaUpload` mutations
- [x] 1.7 Add input types for complex mutations (CreateEventInput, EditEventInput, CreateChoreInput, CreateRelationshipInput, etc.)

## 2. Lambda Handlers

- [x] 2.1 Create `handlers/auth/handler.ts` — refactor existing register.ts into a domain handler routing register, login, socialLogin, updateProfile
- [x] 2.2 Create `handlers/family/handler.ts` — routes createFamily, inviteMember, acceptInvitation, addNonAppPerson, updateMemberRole, transferOwnership, removeMember, updateFamilyTheme, myFamilies, familyMembers
- [x] 2.3 Create `handlers/feed/handler.ts` — routes familyFeed, createPost, deletePost, addReaction, removeReaction, addComment, postComments
- [x] 2.4 Create `handlers/calendar/handler.ts` — routes familyEvents, eventDetail, createEvent, editEvent, deleteEvent, rsvpEvent
- [x] 2.5 Create `handlers/chores/handler.ts` — routes familyChores, createChore, completeChore, rotateChore
- [x] 2.6 Create `handlers/relationships/handler.ts` — routes familyRelationships, createRelationship, editRelationship, deleteRelationship, confirmInference, rejectInference
- [x] 2.7 Create `handlers/tree/handler.ts` — routes familyTree
- [x] 2.8 Create `handlers/media/handler.ts` — routes generateUploadUrl, confirmMediaUpload
- [x] 2.9 Create `handlers/notifications/handler.ts` — routes notificationPreferences, updateNotificationPreference, registerDeviceToken

## 3. Handler Unit Tests

- [x] 3.1 Write tests for auth handler (all 4 operations + error cases)
- [x] 3.2 Write tests for family handler (all 10 operations + error cases)
- [x] 3.3 Write tests for feed handler (all 7 operations + error cases)
- [x] 3.4 Write tests for calendar handler (all 6 operations + error cases)
- [x] 3.5 Write tests for chores handler (all 4 operations + error cases)
- [x] 3.6 Write tests for relationships handler (all 6 operations + error cases)
- [x] 3.7 Write tests for tree handler (1 operation + error case)
- [x] 3.8 Write tests for media handler (2 operations + error cases)
- [x] 3.9 Write tests for notifications handler (3 operations + error cases)

## 4. CDK Wiring

- [x] 4.1 Add `aws-cdk-lib/aws-lambda-nodejs` dependency to infra package
- [x] 4.2 Create Lambda functions for all 9 domain handlers in api-stack.ts (NodejsFunction with esbuild)
- [x] 4.3 Add Lambda data sources to AppSync API (one per domain)
- [x] 4.4 Map every Query field to its domain Lambda resolver
- [x] 4.5 Map every Mutation field to its domain Lambda resolver
- [x] 4.6 Grant DynamoDB table read/write to all Lambda functions
- [x] 4.7 Grant S3 bucket access to media Lambda function
- [x] 4.8 Pass environment variables (TABLE_NAME, S3_BUCKET, STAGE) to Lambda functions
- [x] 4.9 Verify `cdk synth` succeeds with all resolvers

## 5. Verification

- [x] 5.1 All handler unit tests pass with 95%+ coverage
- [x] 5.2 Lint, typecheck pass across all packages
- [x] 5.3 `cdk synth` produces correct CloudFormation templates
- [x] 5.4 Existing unit tests (92) + integration tests (114) still pass
