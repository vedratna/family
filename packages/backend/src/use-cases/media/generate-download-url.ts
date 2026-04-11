import { NotFoundError } from "../../domain/errors";
import type { IMediaRepository, IStorageService } from "../../repositories/interfaces/media-repo";
import type { IMembershipRepository } from "../../repositories/interfaces/membership-repo";

const DOWNLOAD_URL_EXPIRY_SECONDS = 3600; // 1 hour

interface GenerateDownloadUrlInput {
  mediaId: string;
  requesterId: string;
}

export class GenerateDownloadUrl {
  constructor(
    private readonly mediaRepo: IMediaRepository,
    private readonly storageService: IStorageService,
    private readonly membershipRepo: IMembershipRepository,
  ) {}

  async execute(input: GenerateDownloadUrlInput): Promise<string> {
    const media = await this.mediaRepo.getById(input.mediaId);
    if (media === undefined) {
      throw new NotFoundError("Media", input.mediaId);
    }

    // Verify requester is a member of the family this media belongs to
    const memberships = await this.membershipRepo.getByUserId(input.requesterId);
    const isMember = memberships.some((m) => m.familyId === media.familyId);
    if (!isMember) {
      throw new NotFoundError("Media", input.mediaId); // Don't reveal existence
    }

    return this.storageService.generateDownloadUrl(media.s3Key, DOWNLOAD_URL_EXPIRY_SECONDS);
  }
}
