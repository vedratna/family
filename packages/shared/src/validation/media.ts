import { z } from "zod";

import { ALLOWED_MEDIA_TYPES } from "../types/media";

export const RequestUploadInput = z.object({
  familyId: z.string().uuid(),
  contentType: z.enum(ALLOWED_MEDIA_TYPES),
  sizeBytes: z.number().positive().max(500 * 1024 * 1024), // 500MB max
});

export type RequestUploadInputType = z.infer<typeof RequestUploadInput>;
