import { test, expect } from "./helpers/fixtures";
import { stubMediaUpload } from "./helpers/media-mock";

test.describe("Profile photo upload", () => {
  test("upload via Settings with mocked S3, see avatar update", async ({ authedPage: page }) => {
    // Set up media upload mocks BEFORE navigating
    const calls = await stubMediaUpload(page);

    // Navigate to settings
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

    // Find the Profile Photo section
    await expect(page.getByText("Profile Photo")).toBeVisible();

    // Upload a file via the FilePicker
    // Create a synthetic test image using setInputFiles on the hidden file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test-avatar.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-image-data"),
    });

    // Wait for the upload flow to complete
    // The updateProfile mutation will go through (not mocked), but generateUploadUrl
    // and confirmMediaUpload are stubbed. We also need to handle the updateProfile call.
    // Let's wait until the uploading indicator disappears
    await expect(page.getByText("Uploading...")).not.toBeVisible({ timeout: 10_000 });

    // Verify the mock interceptors were called
    expect(calls.generateUploadUrlCalled).toBe(true);
    expect(calls.confirmMediaUploadCalled).toBe(true);
    expect(calls.confirmS3Key).toBe("e2e-stub/profile-photo.jpg");
  });
});
