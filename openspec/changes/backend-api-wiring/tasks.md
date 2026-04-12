## 1. Extend GraphQL Schema

- [ ] 1.1 Add feed types and operations: `Post`, `PaginatedPosts`, `FeedComment`, `PaginatedComments`, `Reaction` types + `familyFeed` query + `createPost`, `deletePost`, `addReaction`, `removeReaction`, `addComment` mutations
- [ ] 1.2 Add calendar types and operations: `Event`, `EventRSVP`, `EventDetail` types + `familyEvents`, `eventDetail` queries + `createEvent`, `editEvent`, `deleteEvent`, `rsvpEvent` mutations
- [ ] 1.3 Add chore types and operations: `Chore` type + `familyChores` query + `createChore`, `completeChore`, `rotateChore` mutations
- [ ] 1.4 Add relationship and tree types and operations: `Relationship`, `FamilyTree`, `TreeNode` types + `familyRelationships`, `familyTree` queries + `createRelationship`, `editRelationship`, `deleteRelationship`, `confirmInference`, `rejectInference` mutations
- [ ] 1.5 Add notification types and operations: `NotificationPreference` type + `notificationPreferences` query + `updateNotificationPreference`, `registerDeviceToken` mutations
- [ ] 1.6 Add media operations: `UploadUrlResult` type + `generateUploadUrl`, `confirmMediaUpload` mutations
- [ ] 1.7 Add input types for complex mutations (CreateEventInput, EditEventInput, CreateChoreInput, CreateRelationshipInput, etc.)

## 2. Lambda Handlers

- [ ] 2.1 Create `handlers/auth/handler.ts` — refactor existing register.ts into a domain handler routing register, login, socialLogin, updateProfile
- [ ] 2.2 Create `handlers/family/handler.ts` — routes createFamily, inviteMember, acceptInvitation, addNonAppPerson, updateMemberRole, transferOwnership, removeMember, updateFamilyTheme, myFamilies, familyMembers
- [ ] 2.3 Create `handlers/feed/handler.ts` — routes familyFeed, createPost, deletePost, addReaction, removeReaction, addComment, postComments
- [ ] 2.4 Create `handlers/calendar/handler.ts` — routes familyEvents, eventDetail, createEvent, editEvent, deleteEvent, rsvpEvent
- [ ] 2.5 Create `handlers/chores/handler.ts` — routes familyChores, createChore, completeChore, rotateChore
- [ ] 2.6 Create `handlers/relationships/handler.ts` — routes familyRelationships, createRelationship, editRelationship, deleteRelationship, confirmInference, rejectInference
- [ ] 2.7 Create `handlers/tree/handler.ts` — routes familyTree
- [ ] 2.8 Create `handlers/media/handler.ts` — routes generateUploadUrl, confirmMediaUpload
- [ ] 2.9 Create `handlers/notifications/handler.ts` — routes notificationPreferences, updateNotificationPreference, registerDeviceToken

## 3. Handler Unit Tests

- [ ] 3.1 Write tests for auth handler (all 4 operations + error cases)
- [ ] 3.2 Write tests for family handler (all 10 operations + error cases)
- [ ] 3.3 Write tests for feed handler (all 7 operations + error cases)
- [ ] 3.4 Write tests for calendar handler (all 6 operations + error cases)
- [ ] 3.5 Write tests for chores handler (all 4 operations + error cases)
- [ ] 3.6 Write tests for relationships handler (all 6 operations + error cases)
- [ ] 3.7 Write tests for tree handler (1 operation + error case)
- [ ] 3.8 Write tests for media handler (2 operations + error cases)
- [ ] 3.9 Write tests for notifications handler (3 operations + error cases)

## 4. CDK Wiring

- [ ] 4.1 Add `aws-cdk-lib/aws-lambda-nodejs` dependency to infra package
- [ ] 4.2 Create Lambda functions for all 9 domain handlers in api-stack.ts (NodejsFunction with esbuild)
- [ ] 4.3 Add Lambda data sources to AppSync API (one per domain)
- [ ] 4.4 Map every Query field to its domain Lambda resolver
- [ ] 4.5 Map every Mutation field to its domain Lambda resolver
- [ ] 4.6 Grant DynamoDB table read/write to all Lambda functions
- [ ] 4.7 Grant S3 bucket access to media Lambda function
- [ ] 4.8 Pass environment variables (TABLE_NAME, S3_BUCKET, STAGE) to Lambda functions
- [ ] 4.9 Verify `cdk synth` succeeds with all resolvers

## 5. Verification

- [ ] 5.1 All handler unit tests pass with 95%+ coverage
- [ ] 5.2 Lint, typecheck pass across all packages
- [ ] 5.3 `cdk synth` produces correct CloudFormation templates
- [ ] 5.4 Existing unit tests (92) + integration tests (114) still pass
