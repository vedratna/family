import { createTestRelationship } from "./helpers/factories";
import { test, expect } from "./helpers/fixtures";

test.describe("Family tree", () => {
  test("add member with relationship, see it in tree view", async ({
    authedPage: page,
    seededFamily,
  }) => {
    // Create a relationship between owner and member via API
    await createTestRelationship(
      seededFamily.owner.id,
      seededFamily.family.familyId,
      seededFamily.family.personId,
      seededFamily.memberPersonId,
      "Parent",
      "Child",
      "biological",
    );

    // Navigate to tree page
    await page.goto("/tree");
    await expect(page.getByRole("heading", { name: "Family Tree" })).toBeVisible();

    // Both members should be visible in the tree
    await expect(page.getByText(seededFamily.owner.displayName)).toBeVisible();
    await expect(page.getByText(seededFamily.member.displayName)).toBeVisible();

    // Verify generation headers exist (the tree should show at least 1 generation)
    await expect(page.getByText(/Generation \d+/)).toBeVisible();
  });
});
