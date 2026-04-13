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
- [x] 3.3 Create typed GraphQL operation strings for all queries
- [x] 3.4 Create typed GraphQL operation strings for all mutations
- [x] 3.5 Create hooks wrapping urql queries/mutations

## 4. Auth System

- [x] 4.1 Create AuthProvider context (currentUser, login, logout, localStorage persistence)
- [x] 4.2 Create LoginPage with Sign Up, Log In (by phone), and quick demo login
- [x] 4.3 Create ProtectedRoute wrapper that redirects to /login when not authenticated
- [x] 4.4 Wire AuthProvider into App.tsx, wrap routes with ProtectedRoute
- [x] 4.5 Add logout button to settings page
- [x] 4.6 Add userByPhone query to schema and local server for phone-based login

## 5. Family Provider — API Mode

- [x] 5.1 Update FamilyProvider to use `myFamilies` query in API mode (returns families for the authenticated user, not static mock list)
- [x] 5.2 Handle empty families state (new signed-up user has no families yet)
- [x] 5.3 Show "Create your first family" flow for users with no families
- [x] 5.4 Wire createFamily mutation — after creation, refetch myFamilies and set as active

## 6. Wire Pages to Real API

- [x] 6.1 Wire FeedPage — use familyFeed query in API mode, not mock data
- [x] 6.2 Wire PostDetailPage — use postComments query in API mode
- [x] 6.3 Wire CalendarPage — use familyEvents query in API mode
- [x] 6.4 Wire EventDetailPage — use eventDetail query in API mode
- [x] 6.5 Wire TreePage — use familyTree query in API mode
- [x] 6.6 Wire PersonPage — use familyRelationships query in API mode
- [x] 6.7 Wire ChoresPage — use familyChores query in API mode
- [x] 6.8 Wire MembersPage — use familyMembers query in API mode
- [x] 6.9 Wire SettingsPage — use notificationPreferences query in API mode
- [x] 6.10 Create `useFamilyData` abstraction hooks that return same shape whether mock or API

## 7. CRUD Forms & Mutations

- [x] 7.1 Add create post form + createPost mutation
- [x] 7.2 Add comment form + addComment mutation
- [x] 7.3 Add reaction toggle + add/removeReaction mutations
- [x] 7.4 Add create event form + createEvent mutation
- [x] 7.5 Add RSVP buttons + rsvpEvent mutation
- [x] 7.6 Add create chore form + createChore mutation
- [x] 7.7 Add complete chore button + completeChore mutation
- [x] 7.8 Add invite member form + inviteMember mutation
- [x] 7.9 Add create relationship form + createRelationship mutation
- [x] 7.10 Add delete post action + deletePost mutation
- [x] 7.11 Add theme picker + updateFamilyTheme mutation
- [x] 7.12 Ensure all mutations refetch relevant queries after success (cache invalidation)

## 8. Loading/Error/Empty States

- [x] 8.1 Loading spinner on all pages while queries are in flight
- [x] 8.2 Error message display when queries/mutations fail
- [x] 8.3 Empty state on all pages when no data exists (no posts, no events, etc.)

## 9. Single-Command Dev

- [x] 9.1 Create scripts/dev.sh orchestrating docker + seed + api + web
- [x] 9.2 Update root package.json dev script to use dev.sh
- [x] 9.3 Add port 4000 cleanup before starting API (prevent EADDRINUSE)

## 10. Verification

- [x] 10.1 Sign up new user → lands on empty state (no families)
- [x] 10.2 Create first family → see empty feed
- [x] 10.3 Create post → see it in feed
- [x] 10.4 Create event → see it in calendar
- [x] 10.5 Create chore → see it; complete it → status updates
- [x] 10.6 Demo user (Mickey Mouse) shows pre-seeded Disney + Simpson families with all data
- [x] 10.7 Family switcher changes theme across app
- [x] 10.8 Full CI passes: lint, typecheck, tests
