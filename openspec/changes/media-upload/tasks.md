## 1. Schema Extensions

- [ ] 1.1 Add `mediaUrls: [String!]!` to Post type in schema.graphql
- [ ] 1.2 Add `mediaIds: [ID!]` to CreatePostInput
- [ ] 1.3 Add `profilePhotoUrl: String` to User type
- [ ] 1.4 Add `profilePhotoUrl: String` to Person type

## 2. Backend — CreatePost Accepts Media

- [ ] 2.1 Update CreatePost use case to accept `mediaIds`
- [ ] 2.2 Extend Post type in @family-app/shared if needed (or store mediaIds in DynamoDB Post item)
- [ ] 2.3 Update DynamoPostRepository.create to persist mediaIds
- [ ] 2.4 Update local server `createPost` resolver to pass mediaIds
- [ ] 2.5 Update Lambda handler `createPost` similarly

## 3. Backend — Field Resolvers for Media URLs

- [ ] 3.1 Add `Post.mediaUrls` resolver in local server (look up media, generate presigned URLs)
- [ ] 3.2 Add `User.profilePhotoUrl` resolver (presigned URL if profilePhotoKey set)
- [ ] 3.3 Add `Person.profilePhotoUrl` resolver
- [ ] 3.4 Update Lambda handlers to enrich the same fields (extend `_shared/enrichment.ts`)

## 4. CDK — S3 CORS

- [ ] 4.1 Verify `storage-stack.ts` includes CORS rules on the media bucket
- [ ] 4.2 Add CORS for PUT/GET from web origins

## 5. Web Components

- [ ] 5.1 Create `web/src/components/FilePicker.tsx` (button + hidden input + thumbnails preview + remove)
- [ ] 5.2 Create `web/src/components/MediaThumbnail.tsx` (image or video thumb, click to open Lightbox)
- [ ] 5.3 Create `web/src/components/Lightbox.tsx` (full-screen modal, escape/backdrop close)
- [ ] 5.4 Create `web/src/lib/upload.ts` with `uploadMedia(file, familyId): Promise<Media>` orchestrating generateUploadUrl → PUT → confirmMediaUpload

## 6. Web — Compose Posts with Media

- [ ] 6.1 Update FeedPage CreatePost form: add FilePicker, validate (4 max, 10MB each), upload all → include mediaIds in createPost mutation
- [ ] 6.2 Update PostDetailPage compose box similarly (if it allows attaching to comments — likely not, defer)
- [ ] 6.3 Show error if upload fails

## 7. Web — Display Media

- [ ] 7.1 PostCard renders MediaThumbnail grid for `mediaUrls`
- [ ] 7.2 PostDetailPage renders full media gallery + lightbox

## 8. Web — Profile Photo

- [ ] 8.1 Add "Change Profile Photo" section on SettingsPage
- [ ] 8.2 FilePicker → upload → call updateProfile mutation with new profilePhotoKey
- [ ] 8.3 Display profilePhotoUrl on MembersPage rows
- [ ] 8.4 Display in AppHeader avatar

## 9. Tests

- [ ] 9.1 Component tests for FilePicker, MediaThumbnail, Lightbox
- [ ] 9.2 Unit test for `lib/upload.ts` (mocked fetch + GraphQL)
- [ ] 9.3 Update e2e test to assert mediaUrls field is queryable on Post

## 10. Verification

- [ ] 10.1 Lint, typecheck, all tests pass
- [ ] 10.2 e2e-test.sh still passes
- [ ] 10.3 Manual: attach photo to post → photo appears
- [ ] 10.4 Manual: set profile photo → appears in members list
- [ ] 10.5 Manual: click media → lightbox opens → escape closes
