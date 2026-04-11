export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/heic"] as const;
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"] as const;
export const ALLOWED_MEDIA_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES] as const;

export type MediaType = (typeof ALLOWED_MEDIA_TYPES)[number];

export interface Media {
  id: string;
  s3Key: string;
  contentType: MediaType;
  sizeBytes: number;
  uploadedBy: string;
  familyId: string;
  createdAt: string;
}
