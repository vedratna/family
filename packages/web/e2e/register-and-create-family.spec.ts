import { test, expect } from "@playwright/test";

test.describe("Register and create first family", () => {
  test("new user signs up, creates family, sees empty feed", async ({ page }, testInfo) => {
    const phone = `+91${String(Date.now())}${String(testInfo.workerIndex)}`;
    const displayName = `E2E Signup ${phone.slice(-4)}`;

    // Navigate to login page
    await page.goto("/login");
    await expect(page.getByText("Welcome to FamilyApp")).toBeVisible();

    // Switch to Sign Up tab
    await page.getByRole("button", { name: "Sign Up" }).click();

    // Fill signup form
    await page.getByLabel("Phone").fill(phone);
    await page.getByLabel("Display Name").fill(displayName);
    await page.getByRole("button", { name: "Sign Up", exact: true }).click();

    // Should redirect to create-first-family page (no families yet)
    await expect(page.getByText("Welcome to Family App!")).toBeVisible();
    await expect(page.getByText(`Signed in as ${displayName}`)).toBeVisible();

    // Fill family creation form
    await page.getByPlaceholder("e.g. The Johnson Family").fill("E2E Test Family");

    // Select a theme (click the first swatch - teal)
    await page.locator('button[title="teal"]').click();

    // Submit
    await page.getByRole("button", { name: "Create Family" }).click();

    // Should navigate to feed with empty state
    await expect(page.getByText("Feed")).toBeVisible();
    await expect(page.getByText("No posts yet")).toBeVisible();
  });
});
