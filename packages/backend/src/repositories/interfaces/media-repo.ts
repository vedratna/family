import type { Media } from "@family-app/shared";

export interface IMediaRepository {
  create(media: Media): Promise<void>;
  getById(mediaId: string): Promise<Media | undefined>;
  getByFamily(familyId: string): Promise<Media[]>;
}

export interface IStorageService {
  generateUploadUrl(key: string, contentType: string, expiresIn: number): Promise<string>;
  generateDownloadUrl(key: string, expiresIn: number): Promise<string>;
}
