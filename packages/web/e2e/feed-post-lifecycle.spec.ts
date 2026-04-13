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
    await page
      .locator("button")
      .filter({ hasText: /\u{1F90D}/u })
      .click();

    // Reaction count should increase - the white heart should become red heart
    await expect(page.locator("button").filter({ hasText: /\u{2764}\u{FE0F}/u })).toBeVisible();
  });
});
