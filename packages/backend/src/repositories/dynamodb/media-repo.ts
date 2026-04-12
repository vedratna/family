import type { Media } from "@family-app/shared";

import type { IMediaRepository } from "../interfaces/media-repo";

import { keys } from "./keys";
import { getItem, putItem, queryItems } from "./operations";

export class DynamoMediaRepository implements IMediaRepository {
  async create(media: Media): Promise<void> {
    await Promise.all([
      putItem({
        PK: keys.family.pk(media.familyId),
        SK: `MEDIA#${media.id}`,
        id: media.id,
        s3Key: media.s3Key,
        contentType: media.contentType,
        sizeBytes: media.sizeBytes,
        uploadedBy: media.uploadedBy,
        familyId: media.familyId,
        createdAt: media.createdAt,
        entityType: "Media",
      }),
      putItem({
        PK: `MEDIA#${media.id}`,
        SK: "METADATA",
        familyId: media.familyId,
        entityType: "MediaLookup",
      }),
    ]);
  }

  async getById(mediaId: string): Promise<Media | undefined> {
    const lookupItem = await getItem(`MEDIA#${mediaId}`, "METADATA");
    if (lookupItem === undefined) {
      return undefined;
    }
    const familyId = lookupItem["familyId"] as string;
    const item = await getItem(keys.family.pk(familyId), `MEDIA#${mediaId}`);
    if (item === undefined) {
      return undefined;
    }
    return this.toEntity(familyId, item);
  }

  async getByFamily(familyId: string): Promise<Media[]> {
    const result = await queryItems("PK", keys.family.pk(familyId), keys.prefix.media);
    return result.items.map((item) => this.toEntity(familyId, item));
  }

  private toEntity(familyId: string, item: Record<string, unknown>): Media {
    return {
      id: item["id"] as string,
      s3Key: item["s3Key"] as string,
      contentType: item["contentType"] as Media["contentType"],
      sizeBytes: item["sizeBytes"] as number,
      uploadedBy: item["uploadedBy"] as string,
      familyId,
      createdAt: item["createdAt"] as string,
    };
  }
}
