## ADDED Requirements

### Requirement: Direct-to-S3 media upload
The system SHALL allow clients to upload photos and videos directly to S3 using presigned upload URLs. The backend SHALL generate presigned URLs upon request and store media metadata in the database after successful upload.

#### Scenario: Upload a photo
- **WHEN** a member requests a presigned upload URL for a photo
- **THEN** the system SHALL return a presigned URL, the client uploads directly to S3, and upon completion the backend stores the media metadata (S3 key, content type, size, uploader, family)

### Requirement: Secure media retrieval
The system SHALL serve media files via presigned download URLs or CloudFront signed URLs. Media SHALL only be accessible to members of the family the media belongs to.

#### Scenario: View a photo in the feed
- **WHEN** a family member views a post containing a photo
- **THEN** the system SHALL generate a time-limited signed URL for the photo, accessible only within the family context

#### Scenario: Non-member attempts to access media
- **WHEN** a user who is not a member of the family attempts to access a media URL after it expires
- **THEN** the system SHALL deny access

### Requirement: Supported media types
The system SHALL support the following media types: JPEG, PNG, GIF, HEIC for photos; MP4, MOV for videos.

#### Scenario: Upload unsupported file type
- **WHEN** a member attempts to upload a .exe file
- **THEN** the system SHALL reject the upload with a validation error

### Requirement: Media metadata tracking
The system SHALL track metadata for all uploaded media: file size, content type, upload timestamp, uploader, associated family, and associated post/entity.

#### Scenario: Query media by family
- **WHEN** the system queries all media for a family
- **THEN** the results SHALL include all photos and videos uploaded within that family context with metadata
