import { test, expect } from "./helpers/fixtures";

test.describe("Feed post lifecycle", () => {
  test("create post, see it in feed, add comment, add reaction", async ({ authedPage: page }) => {
    const postText = `E2E post ${String(Date.now())}`;

    // Navigate to feed
    await page.goto("/feed");
    await expect(page.getByRole("heading", { name: "Feed" })).toBeVisible();

    // Open new post form
    await page.getByRole("button", { name: "New Post" }).click();

    // Write and submit post
    await page.getByPlaceholder("What's on your mind?").fill(postText);
    await page.getByRole("button", { name: "Post" }).click();

    // Post should appear in feed
    await expect(page.getByText(postText)).toBeVisible();

    // Click on the post to go to detail page
    await page.getByText(postText).click();

    // Verify on post detail page
    await expect(page.getByText(postText)).toBeVisible();

    // Add a comment
    const commentText = `E2E comment ${String(Date.now())}`;
    await page.getByPlaceholder("Write a comment...").fill(commentText);
    await page.getByRole("button", { name: "Send" }).click();

    // Comment should appear
    await expect(page.getByText(commentText)).toBeVisible();

    // Add a reaction (click the heart/reaction button)
    // The reaction button initially shows 🤍 with count 0
    const reactionButton = page.locator("button").filter({ hasText: "\uD83E\uDD0D" });
    await expect(reactionButton).toBeVisible();
    await reactionButton.click();

    // Wait for the reaction count to become 1 (button contains heart emoji + "1")
    await expect(page.locator("button").filter({ hasText: "1" }).first()).toBeVisible({
      timeout: 10000,
    });
  });
});
