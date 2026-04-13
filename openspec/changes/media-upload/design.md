## Context

The app is built around family memories. Backend has full media support: S3 bucket (CDK Storage stack), `IStorageService` with presigned URL generation, `MediaRepository`, `generateUploadUrl` and `confirmMediaUpload` mutations. Web app exposes none of this. Posts are text-only.

## Goals / Non-Goals

**Goals:**

- Users can attach photos to posts (browser file picker)
- Users can set a profile photo
- Photos display inline on posts and member rows
- Click photo → lightbox view
- Max 4 photos per post, 10MB each (client + server validated)
- Both image and video uploads supported (videos play inline)

**Non-Goals:**

- Video editing / trimming
- Camera capture (use file picker; mobile browsers can pick from camera natively)
- Photo albums / collections (just per-post media)
- Image compression / resizing (defer; could be added via S3 Lambda later)
- Drag-to-reorder photos in a post (defer)

## Decisions

### 1. Upload Flow

```
1. User selects file in browser <input type="file">
2. Client validates: type, size
3. Client calls generateUploadUrl(familyId, contentType, sizeBytes)
4. Backend returns { uploadUrl, s3Key } (presigned PUT URL)
5. Client PUTs file directly to S3 (multipart not needed for <10MB)
6. Client calls confirmMediaUpload(input) → returns Media record
7. Client includes media.id in createPost mutation
```

**Rationale:** Standard pattern. Direct browser → S3 means files don't go through our Lambda (saves cost + bandwidth + cold start size).

### 2. Schema Extension

Extend `Post` type:

```graphql
type Post {
  ...existing...
  mediaUrls: [String!]!     # download URLs (presigned, server-resolved)
}
```

Extend `CreatePostInput`:

```graphql
input CreatePostInput {
  familyId: ID!
  textContent: String!
  mediaIds: [ID!] # optional list of confirmed Media IDs
}
```

Extend `User` type:

```graphql
type User {
  ...existing...
  profilePhotoUrl: String   # presigned download URL if profilePhotoKey is set
}
```

Add `Person.profilePhotoUrl` similarly for member display.

### 3. Backend Updates

- `CreatePost` use case accepts `mediaIds`, stores them with the post (Post type already has space for media key references — might need to extend)
- `Post` field resolver `mediaUrls` looks up each Media by ID, generates a presigned download URL via `IStorageService.generateDownloadUrl`
- Same for `User.profilePhotoUrl` and `Person.profilePhotoUrl`
- `confirmMediaUpload` already exists — verify it stores Media record correctly

For the local server: same field resolvers via Apollo Server Resolver functions.
For Lambda handlers: enrichment helper extended to handle media URL resolution.

### 4. CORS on S3

S3 bucket needs CORS allowing PUT from web origin. The CDK storage-stack already creates the bucket but CORS may not be set. Add CORS config:

```
allowedMethods: PUT, GET
allowedOrigins: '*' (locally) or specific origins (prod)
allowedHeaders: '*'
maxAgeSeconds: 3000
```

### 5. UI Components

**FilePicker:** Hidden `<input type="file" accept="image/*,video/*" multiple>` triggered by a button. Shows selected file thumbnails before submit.

**MediaThumbnail:** Renders an image or video thumbnail. Click opens lightbox.

**Lightbox:** Simple full-screen modal showing the full media. Close on Escape or backdrop click.

**ProfilePhotoUploader:** Single-file picker for profile photo on Settings page.

### 6. Validation

Client-side:

- Max 10MB per file
- Max 4 files per post
- Allowed types: image/jpeg, image/png, image/webp, video/mp4, video/quicktime

Server-side (already enforced):

- `generateUploadUrl` accepts `sizeBytes` and validates against a backend limit
- `confirmMediaUpload` validates the s3Key exists

## Risks / Trade-offs

**[Local S3 simulation]** — local dev doesn't have a local S3; presigned URLs point to real AWS. Either:

- Use MinIO locally (extra setup)
- Skip media in local mock mode; only test in deployed dev
- Use real AWS S3 from local dev

Decided: real S3 from local. The dev S3 bucket exists; presigned URLs work. Document the credential requirement.

**[Direct-to-S3 CORS]** — CORS misconfiguration is the most common bug. Verify CDK adds CORS rules to the bucket.

**[N+1 on profile photo URLs]** — every member render triggers a presigned URL generation. Acceptable for small families. Document for future caching.

**[Presigned URL lifetime]** — short-lived URLs (1 hour). Page refreshes regenerate them. Pros: secure. Cons: cached HTML breaks. Mitigate: fetch URLs at render time (already the case via field resolvers).
