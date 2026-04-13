## Why

The app is built around family memories — photos and videos are core to the value. Backend has full media support: S3 bucket, presigned upload URLs, media metadata storage, all wired through `generateUploadUrl` and `confirmMediaUpload` mutations. The web app exposes none of this. Posts are text-only.

## What Changes

**File picker UI:**

- "Add Photo" button on CreatePost form (FeedPage and PostDetailPage compose area)
- Native `<input type="file" accept="image/*,video/*">` triggers picker
- Show selected file preview before posting
- Upload happens before the post is created (so the post can include the s3Key)

**Upload flow:**

1. User selects file → call `generateUploadUrl(familyId, contentType, sizeBytes)` → returns `uploadUrl` and `s3Key`
2. PUT the file directly to `uploadUrl` (S3 presigned URL)
3. On success, call `confirmMediaUpload(input)` → returns Media record
4. Now create the post with `mediaIds: [media.id]` (need to extend createPost to accept media)

**Schema extension:**

- Extend `Post` type with `mediaUrls: [String!]!` (resolved to S3 download URLs server-side)
- Extend `CreatePostInput` with `mediaIds: [ID!]`
- Update CreatePost use case to accept and store mediaIds with the post

**Display:**

- PostCard renders thumbnail grid for media
- Click thumbnail → lightbox/full-size view (simple modal)
- Lazy-load images

**Person profile photos:**

- Member rows show profile photo if set
- Settings page: upload your profile photo (calls updateProfile with profilePhotoKey)

**Limits:**

- Max file size: 10MB per file (validated client-side, also server-side via sizeBytes check)
- Max 4 photos per post (UI limit, server allows more)

## Capabilities

### New Capabilities

- `media-upload-ui`: File picker, S3 presigned upload, media display in posts and profiles

### Modified Capabilities

- `graphql-api-complete`: Post type adds mediaUrls; CreatePostInput adds mediaIds
- `crud-completeness`: CreatePost flow now supports attaching media

## Impact

- **New files**: `web/src/components/FilePicker.tsx`, `web/src/components/MediaThumbnail.tsx`, `web/src/components/Lightbox.tsx`, `web/src/lib/upload.ts`
- **Modified files**: FeedPage, PostDetailPage (compose area), MembersPage (display photos), SettingsPage (profile photo upload), schema.graphql, local-server, lambda handlers
- **Backend changes**: Post.mediaUrls field resolver (look up media by IDs and return download URLs); CreatePost use case accepts mediaIds
- **CDK**: ensure CORS is set on S3 bucket for cross-origin uploads from web
- **Prerequisite**: `lambda-handler-name-resolution` (consistent field-resolver pattern)
