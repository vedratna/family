## 1. Schema Extensions

- [x] 1.1 Add `mediaUrls: [String!]!` to Post type in schema.graphql
- [x] 1.2 Add `mediaIds: [ID!]` to CreatePostInput
- [x] 1.3 Add `profilePhotoUrl: String` to User type
- [x] 1.4 Add `profilePhotoUrl: String` to Person type

## 2. Backend — CreatePost Accepts Media

- [x] 2.1 Update CreatePost use case to accept `mediaIds`
- [x] 2.2 Extend Post type in @family-app/shared if needed (or store mediaIds in DynamoDB Post item)
- [x] 2.3 Update DynamoPostRepository.create to persist mediaIds
- [x] 2.4 Update local server `createPost` resolver to pass mediaIds
- [x] 2.5 Update Lambda handler `createPost` similarly

## 3. Backend — Field Resolvers for Media URLs

- [x] 3.1 Add `Post.mediaUrls` resolver in local server (look up media, generate presigned URLs)
- [x] 3.2 Add `User.profilePhotoUrl` resolver (presigned URL if profilePhotoKey set)
- [x] 3.3 Add `Person.profilePhotoUrl` resolver
- [x] 3.4 Update Lambda handlers to enrich the same fields (extend `_shared/enrichment.ts`)

## 4. CDK — S3 CORS

- [x] 4.1 Verify `storage-stack.ts` includes CORS rules on the media bucket
- [x] 4.2 Add CORS for PUT/GET from web origins

## 5. Web Components

- [x] 5.1 Create `web/src/components/FilePicker.tsx` (button + hidden input + thumbnails preview + remove)
- [x] 5.2 Create `web/src/components/MediaThumbnail.tsx` (image or video thumb, click to open Lightbox)
- [x] 5.3 Create `web/src/components/Lightbox.tsx` (full-screen modal, escape/backdrop close)
- [x] 5.4 Create `web/src/lib/upload.ts` with `uploadMedia(file, familyId): Promise<Media>` orchestrating generateUploadUrl → PUT → confirmMediaUpload

## 6. Web — Compose Posts with Media

- [x] 6.1 Update FeedPage CreatePost form: add FilePicker, validate (4 max, 10MB each), upload all → include mediaIds in createPost mutation
- [x] 6.2 Update PostDetailPage compose box similarly (if it allows attaching to comments — likely not, defer)
- [x] 6.3 Show error if upload fails

## 7. Web — Display Media

- [x] 7.1 PostCard renders MediaThumbnail grid for `mediaUrls`
- [x] 7.2 PostDetailPage renders full media gallery + lightbox

## 8. Web — Profile Photo

- [x] 8.1 Add "Change Profile Photo" section on SettingsPage
- [x] 8.2 FilePicker → upload → call updateProfile mutation with new profilePhotoKey
- [x] 8.3 Display profilePhotoUrl on MembersPage rows
- [x] 8.4 Display in AppHeader avatar

## 9. Tests

- [x] 9.1 Component tests for FilePicker, MediaThumbnail, Lightbox
- [x] 9.2 Unit test for `lib/upload.ts` (mocked fetch + GraphQL)
- [x] 9.3 Update e2e test to assert mediaUrls field is queryable on Post

## 10. Verification

- [x] 10.1 Lint, typecheck, all tests pass
- [x] 10.2 e2e-test.sh still passes
- [x] 10.3 Manual: attach photo to post → photo appears
- [x] 10.4 Manual: set profile photo → appears in members list
- [x] 10.5 Manual: click media → lightbox opens → escape closes
