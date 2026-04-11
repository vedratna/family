import type { Media, MediaType } from "@family-app/shared";

import type { IMediaRepository } from "../../repositories/interfaces/media-repo";

interface ConfirmMediaUploadInput {
  s3Key: string;
  contentType: MediaType;
  sizeBytes: number;
  uploadedBy: string;
  familyId: string;
}

export class ConfirmMediaUpload {
  constructor(private readonly mediaRepo: IMediaRepository) {}

  async execute(input: ConfirmMediaUploadInput): Promise<Media> {
    const media: Media = {
      id: crypto.randomUUID(),
      s3Key: input.s3Key,
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
      uploadedBy: input.uploadedBy,
      familyId: input.familyId,
      createdAt: new Date().toISOString(),
    };

    await this.mediaRepo.create(media);

    return media;
  }
}
