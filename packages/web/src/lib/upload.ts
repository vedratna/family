import type { OperationResult } from "urql";

export interface UploadedMedia {
  id: string;
  s3Key: string;
  contentType: string;
}

type GenerateUploadUrlFn = (vars: {
  familyId: string;
  contentType: string;
  sizeBytes: number;
}) => Promise<
  OperationResult<{
    generateUploadUrl: { uploadUrl: string; s3Key: string };
  }>
>;

type ConfirmMediaUploadFn = (vars: {
  input: { s3Key: string; contentType: string; sizeBytes: number; familyId: string };
}) => Promise<
  OperationResult<{
    confirmMediaUpload: { id: string };
  }>
>;

export async function uploadMedia(
  file: File,
  familyId: string,
  generateUploadUrl: GenerateUploadUrlFn,
  confirmMediaUpload: ConfirmMediaUploadFn,
): Promise<UploadedMedia> {
  // 1. Get presigned URL
  const urlResult = await generateUploadUrl({
    familyId,
    contentType: file.type,
    sizeBytes: file.size,
  });
  if (urlResult.error || !urlResult.data) {
    throw new Error("Failed to get upload URL");
  }
  const { uploadUrl, s3Key } = urlResult.data.generateUploadUrl;

  // 2. PUT to S3
  const putResp = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!putResp.ok) {
    throw new Error(`S3 upload failed: ${putResp.statusText}`);
  }

  // 3. Confirm
  const confirmResult = await confirmMediaUpload({
    input: { s3Key, contentType: file.type, sizeBytes: file.size, familyId },
  });
  if (confirmResult.error || !confirmResult.data) {
    throw new Error("Failed to confirm upload");
  }

  return {
    id: confirmResult.data.confirmMediaUpload.id,
    s3Key,
    contentType: file.type,
  };
}
