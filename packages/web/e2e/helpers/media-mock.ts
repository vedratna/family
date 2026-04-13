import type { Page } from "@playwright/test";

const STUB_S3_KEY = "e2e-stub/profile-photo.jpg";
const STUB_UPLOAD_URL = "https://s3.stub.local/upload";

interface InterceptedCalls {
  generateUploadUrlCalled: boolean;
  confirmMediaUploadCalled: boolean;
  confirmS3Key: string | null;
}

/**
 * Sets up route interception to stub `generateUploadUrl` and the subsequent S3 PUT,
 * then tracks whether `confirmMediaUpload` was called.
 *
 * Call this BEFORE performing the upload action in the UI.
 * After the upload, read `calls` to assert the correct mutations were invoked.
 */
export async function stubMediaUpload(page: Page): Promise<InterceptedCalls> {
  const calls: InterceptedCalls = {
    generateUploadUrlCalled: false,
    confirmMediaUploadCalled: false,
    confirmS3Key: null,
  };

  // Intercept GraphQL requests to the API
  await page.route("**/graphql", async (route, request) => {
    const postData = request.postDataJSON() as {
      query: string;
      variables?: Record<string, unknown>;
    } | null;

    if (postData === null) {
      await route.continue();
      return;
    }

    // Intercept generateUploadUrl mutation
    if (postData.query.includes("generateUploadUrl")) {
      calls.generateUploadUrlCalled = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            generateUploadUrl: {
              uploadUrl: STUB_UPLOAD_URL,
              s3Key: STUB_S3_KEY,
            },
          },
        }),
      });
      return;
    }

    // Intercept confirmMediaUpload mutation
    if (postData.query.includes("confirmMediaUpload")) {
      calls.confirmMediaUploadCalled = true;
      const input = (postData.variables?.input ?? {}) as Record<string, unknown>;
      calls.confirmS3Key = (input.s3Key as string | undefined) ?? null;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            confirmMediaUpload: {
              id: "media-e2e-stub",
              familyId: input.familyId ?? "unknown",
              s3Key: STUB_S3_KEY,
              contentType: input.contentType ?? "image/jpeg",
              sizeBytes: input.sizeBytes ?? 1024,
              uploadedBy: "e2e-user",
              createdAt: new Date().toISOString(),
            },
          },
        }),
      });
      return;
    }

    // Let all other GraphQL requests through
    await route.continue();
  });

  // Intercept the S3 PUT request
  await page.route(STUB_UPLOAD_URL, async (route) => {
    await route.fulfill({ status: 200, body: "" });
  });

  return calls;
}
