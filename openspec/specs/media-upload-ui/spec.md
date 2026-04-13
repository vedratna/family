## Purpose

Users attach photos/videos to posts and set profile photos. Media uploads go browser → S3 via presigned URLs; presigned download URLs are resolved server-side at query time.

## Requirements

### Requirement: Users can attach media to posts

The CreatePost form on FeedPage SHALL allow attaching photos and videos via file picker. Attached media is uploaded to S3 before the post is created.

#### Scenario: Attach photo to post

- **WHEN** user clicks "Add Photo" on the new-post form
- **AND** selects an image file
- **THEN** the file is uploaded to S3 via presigned URL
- **AND** a thumbnail appears in the form
- **AND** submitting the post includes the media in the `mediaIds`
- **AND** the post displays the photo

#### Scenario: Validate file type and size

- **WHEN** user selects a non-supported file type (e.g., .exe)
- **THEN** an error message is shown
- **AND** the file is not uploaded

- **WHEN** user selects a file larger than 10MB
- **THEN** an error message is shown
- **AND** the file is not uploaded

#### Scenario: Multiple files per post

- **WHEN** user selects multiple files in one go (up to 4)
- **THEN** all are uploaded
- **AND** all thumbnails appear in the form

- **WHEN** user tries to select more than 4 files
- **THEN** an error message is shown

### Requirement: Posts display attached media

The PostCard and PostDetailPage SHALL display attached media (photos and videos) in a thumbnail grid; clicking a thumbnail opens a lightbox.

#### Scenario: Photos render inline

- **WHEN** a post has 1+ attached photos
- **THEN** thumbnails render below the post text
- **AND** clicking a thumbnail opens a lightbox showing the full image

#### Scenario: Videos play inline

- **WHEN** a post has a video attachment
- **THEN** a video player with controls renders below the post text

### Requirement: Users can set a profile photo

The Settings page SHALL allow uploading a profile photo. The photo displays on member rows and the active user's header.

#### Scenario: Upload profile photo

- **WHEN** user clicks "Change Profile Photo" on Settings
- **AND** selects an image file
- **THEN** the photo uploads to S3
- **AND** `updateProfile` mutation is called with the new `profilePhotoKey`
- **AND** the photo appears on the user's member row

### Requirement: Lightbox component

A reusable `Lightbox` component SHALL display media full-screen with close-on-escape and backdrop click.

#### Scenario: Lightbox opens with media

- **WHEN** user clicks a media thumbnail
- **THEN** Lightbox renders with the full image/video
- **AND** the rest of the app is dimmed via backdrop

#### Scenario: Lightbox closes on Escape or backdrop

- **WHEN** user presses Escape or clicks the backdrop
- **THEN** Lightbox closes

### Requirement: GraphQL schema includes resolved media URLs

The `Post.mediaUrls` field SHALL be resolved server-side to presigned download URLs from S3.

#### Scenario: Post returns mediaUrls

- **WHEN** the GraphQL client queries `Post { mediaUrls }`
- **THEN** the server resolves each attached Media's s3Key to a presigned download URL
- **AND** returns them as a list of strings
