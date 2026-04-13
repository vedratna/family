import { test, expect } from "./helpers/fixtures";

test.describe("Chores", () => {
  test("create chore, complete it, delete it", async ({ authedPage: page }) => {
    const choreTitle = `E2E Chore ${String(Date.now())}`;

    // Navigate to chores
    await page.goto("/chores");
    await expect(page.getByRole("heading", { name: "Chores" })).toBeVisible();

    // Open new chore form
    await page.getByRole("button", { name: "New Chore" }).click();

    // Fill chore form
    await page.getByPlaceholder("Chore title").fill(choreTitle);
    // Select the first member as assignee (the owner's person)
    await page.locator("select").selectOption({ index: 1 });

    // Submit
    await page.getByRole("button", { name: "Create Chore" }).click();

    // Chore should appear with "pending" status
    await expect(page.getByText(choreTitle)).toBeVisible();
    const choreCard = page.locator("div").filter({ hasText: choreTitle }).last();
    await expect(choreCard.getByText("pending")).toBeVisible();

    // Complete the chore
    await choreCard.getByRole("button", { name: "Complete" }).click();

    // Status should change to "completed"
    await expect(choreCard.getByText("completed")).toBeVisible();

    // Delete the chore
    await choreCard.getByRole("button", { name: "Delete" }).click();

    // Confirm deletion in the modal
    await page.getByRole("button", { name: "Delete" }).last().click();

    // Chore should be gone from the list
    await expect(page.getByText(choreTitle)).not.toBeVisible();
  });
});
