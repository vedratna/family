import { ALLOWED_MEDIA_TYPES, type MediaType } from "@family-app/shared";

import { ValidationError } from "../../domain/errors";
import type { IStorageService } from "../../repositories/interfaces/media-repo";

const UPLOAD_URL_EXPIRY_SECONDS = 3600; // 1 hour
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

interface GenerateUploadUrlInput {
  familyId: string;
  contentType: string;
  sizeBytes: number;
  userId: string;
}

interface GenerateUploadUrlResult {
  uploadUrl: string;
  s3Key: string;
}

export class GenerateUploadUrl {
  constructor(private readonly storageService: IStorageService) {}

  async execute(input: GenerateUploadUrlInput): Promise<GenerateUploadUrlResult> {
    if (!ALLOWED_MEDIA_TYPES.includes(input.contentType as MediaType)) {
      throw new ValidationError(
        `Unsupported file type: ${input.contentType}. Allowed: ${ALLOWED_MEDIA_TYPES.join(", ")}`,
      );
    }

    if (input.sizeBytes > MAX_FILE_SIZE) {
      throw new ValidationError(`File too large. Maximum size: ${String(MAX_FILE_SIZE)} bytes.`);
    }

    const extension = input.contentType.split("/")[1] ?? "bin";
    const s3Key = `families/${input.familyId}/media/${crypto.randomUUID()}.${extension}`;

    const uploadUrl = await this.storageService.generateUploadUrl(
      s3Key,
      input.contentType,
      UPLOAD_URL_EXPIRY_SECONDS,
    );

    return { uploadUrl, s3Key };
  }
}
