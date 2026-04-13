## 1. Local Server — Full Resolver Implementation

- [x] 1.1 Rewrite `local-server/index.ts` resolvers to call real use cases with DynamoDB repos for all auth operations (register, updateProfile)
- [x] 1.2 Add family domain resolvers (myFamilies, familyMembers, createFamily, inviteMember, acceptInvitation, addNonAppPerson, updateMemberRole, transferOwnership, removeMember, updateFamilyTheme)
- [x] 1.3 Add feed domain resolvers (familyFeed, postComments, createPost, deletePost, addReaction, removeReaction, addComment)
- [x] 1.4 Add calendar domain resolvers (familyEvents, eventDetail, createEvent, editEvent, deleteEvent, rsvpEvent)
- [x] 1.5 Add chores domain resolvers (familyChores, createChore, completeChore, rotateChore)
- [x] 1.6 Add relationships domain resolvers (familyRelationships, createRelationship, editRelationship, deleteRelationship, confirmInference, rejectInference)
- [x] 1.7 Add tree domain resolver (familyTree)
- [x] 1.8 Add media domain resolvers (generateUploadUrl, confirmMediaUpload)
- [x] 1.9 Add notifications domain resolvers (notificationPreferences, updateNotificationPreference, registerDeviceToken)
- [x] 1.10 Verify local server starts and responds to all 33 operations

## 2. Seed Script — Complete Dataset

- [x] 2.1 Extend seed.ts to create 2 users, 2 families, 6 persons, 4 memberships
- [x] 2.2 Add seed data for relationships (5), posts (8) with comments and reactions
- [x] 2.3 Add seed data for events (3) with RSVPs, chores (3), notification preferences
- [x] 2.4 Add `npm run seed` script that runs seed against DynamoDB Local
- [x] 2.5 Verify: start DynamoDB Local, run seed, query via local server — data returns

## 3. GraphQL Client (urql)

- [x] 3.1 Install urql, graphql, @urql/exchange-auth in web package
- [x] 3.2 Create urql client with auth exchange (x-user-id header from auth context)
- [x] 3.3 Create typed GraphQL operation strings for all queries (familyFeed, familyEvents, familyChores, familyRelationships, familyTree, familyMembers, postComments, eventDetail, notificationPreferences, myFamilies)
- [x] 3.4 Create typed GraphQL operation strings for all mutations (createPost, deletePost, addReaction, removeReaction, addComment, createEvent, editEvent, deleteEvent, rsvpEvent, createChore, completeChore, rotateChore, createRelationship, editRelationship, deleteRelationship, inviteMember, updateFamilyTheme, updateNotificationPreference, registerDeviceToken)
- [x] 3.5 Create `useData` hooks that switch between mock and API mode based on VITE_MOCK_MODE

## 4. Auth System

- [x] 4.1 Create AuthProvider context (currentUser, login, logout)
- [x] 4.2 Create LoginPage with seed user selector list
- [x] 4.3 Create ProtectedRoute wrapper that redirects to /login when not authenticated
- [x] 4.4 Wire AuthProvider into App.tsx, wrap routes with ProtectedRoute
- [x] 4.5 Add logout button to header/settings

## 5. CRUD Forms & Mutations

- [x] 5.1 Add create post form to FeedPage (text input + submit)
- [x] 5.2 Add comment form to PostDetailPage
- [x] 5.3 Add reaction toggle to post cards
- [x] 5.4 Add create event form (modal or page) accessible from CalendarPage
- [x] 5.5 Add RSVP buttons to EventDetailPage
- [x] 5.6 Add create chore form accessible from ChoresPage
- [x] 5.7 Add complete chore button to chore cards
- [x] 5.8 Add invite member form to MembersPage
- [x] 5.9 Add create relationship form to PersonPage
- [x] 5.10 Add delete post action with confirmation
- [x] 5.11 Add theme picker to SettingsPage that calls updateFamilyTheme mutation

## 6. Page Updates (Loading/Error/Empty States)

- [x] 6.1 Update all pages to show loading spinner while queries are in flight
- [x] 6.2 Update all pages to show error message on query/mutation failure
- [x] 6.3 Update all pages to show empty state when no data exists
- [x] 6.4 Refetch queries after mutations (cache invalidation)

## 7. Tests & Verification

- [x] 7.1 Write unit tests for urql client setup and auth exchange
- [x] 7.2 Write unit tests for GraphQL operation hooks (mock urql responses)
- [x] 7.3 Write component tests for LoginPage, create forms, CRUD actions
- [x] 7.4 Verify 95%+ coverage on new code
- [x] 7.5 Full CI passes: lint, typecheck, tests across all packages
- [x] 7.6 Manual verification: `npm run dev` → seed → register → create family → post → comment → react → create event → RSVP → create chore → complete → full workflow works
