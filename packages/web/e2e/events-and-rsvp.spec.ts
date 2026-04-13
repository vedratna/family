import { test, expect } from "./helpers/fixtures";

test.describe("Events and RSVP", () => {
  test("create event, see it on calendar, RSVP", async ({ authedPage: page }) => {
    const eventTitle = `E2E Event ${String(Date.now())}`;
    // Use a date 30 days from now to ensure it shows in the calendar range
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const startDate = futureDate.toISOString().split("T")[0] as string;

    // Navigate to calendar
    await page.goto("/calendar");
    await expect(page.getByRole("heading", { name: "Calendar" })).toBeVisible();

    // Open new event form
    await page.getByRole("button", { name: "New Event" }).click();

    // Fill event form
    await page.getByPlaceholder("Event title").fill(eventTitle);
    await page.locator("select").selectOption("social-function");
    await page.locator('input[type="date"]').fill(startDate);

    // Submit
    await page.getByRole("button", { name: "Create Event" }).click();

    // Event should appear in the calendar
    await expect(page.getByText(eventTitle)).toBeVisible();

    // Click event to go to detail page
    await page.getByText(eventTitle).click();

    // Verify on event detail page
    await expect(page.getByText(eventTitle)).toBeVisible();
    await expect(page.getByText(startDate)).toBeVisible();

    // RSVP as "Going"
    await page.getByRole("button", { name: "Going" }).click();

    // The "Going" button should now be active (styled differently)
    // Verify the RSVP appears in the list
    await expect(page.getByText("RSVPs (1)")).toBeVisible();
  });
});
