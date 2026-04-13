import { test, expect } from "@playwright/test";

import { loginAs } from "./helpers/auth";
import { createTestUser, createTestFamily, addTestMember } from "./helpers/factories";

test.describe("Invite flow", () => {
  test("invite by phone, new user registers and accepts, sees family", async ({
    browser,
  }, testInfo) => {
    // Setup: create owner and family via API
    const owner = await createTestUser(testInfo.workerIndex, "Inviter");
    const family = await createTestFamily(owner.id, `Invite Family ${String(Date.now())}`);

    // We need a second member so the family is "active" (activation gate requires 2+ members)
    const helper = await createTestUser(testInfo.workerIndex, "Helper");
    await addTestMember(owner.id, family.familyId, helper.phone, helper.displayName);
    // Accept as helper (via API, to activate the family)
    const { gqlRequest } = await import("./helpers/graphql");
    await gqlRequest(
      `mutation AcceptInvitation($familyId: ID!, $phone: String!, $displayName: String!) {
        acceptInvitation(familyId: $familyId, phone: $phone, displayName: $displayName) {
          person { id } role
        }
      }`,
      { familyId: family.familyId, phone: helper.phone, displayName: helper.displayName },
      helper.id,
    );

    // Owner invites a new phone via the Members UI
    const invitePhone = `+91${String(Date.now())}${String(testInfo.workerIndex)}9`;
    const inviteeName = "Invitee E2E";

    const ownerContext = await browser.newContext();
    const ownerPage = await ownerContext.newPage();
    await loginAs(ownerPage, owner.id, owner.displayName, owner.phone);
    await ownerPage.goto("/settings/members");

    await expect(ownerPage.getByRole("heading", { name: "Members" })).toBeVisible();

    // Click Invite button
    await ownerPage.getByRole("button", { name: "Invite", exact: true }).click();

    // Fill invite form
    await ownerPage.getByPlaceholder("Phone number").fill(invitePhone);
    await ownerPage.getByPlaceholder("Name").fill(inviteeName);
    await ownerPage.getByPlaceholder("Relationship").fill("Cousin");
    await ownerPage.getByRole("button", { name: "Send Invite" }).click();

    // Wait for form to close (invite sent)
    await expect(ownerPage.getByPlaceholder("Phone number")).not.toBeVisible();
    await ownerContext.close();

    // Invitee registers with that phone in a new context
    const inviteeContext = await browser.newContext();
    const inviteePage = await inviteeContext.newPage();

    await inviteePage.goto("/login");
    await inviteePage.getByRole("button", { name: "Sign Up" }).click();
    await inviteePage.getByLabel("Phone").fill(invitePhone);
    await inviteePage.getByLabel("Display Name").fill(inviteeName);
    await inviteePage.getByRole("button", { name: "Sign Up", exact: true }).nth(1).click();

    // Should see the create-first-family page with invitation
    await expect(inviteePage.getByText("Welcome to Family App!")).toBeVisible();

    // Switch to Invitations tab to see the pending invitation
    await inviteePage.getByRole("button", { name: /Invitations/ }).click();

    // The invitation should be visible
    await expect(inviteePage.getByText(family.familyName, { exact: true })).toBeVisible();

    // Accept the invitation
    await inviteePage.getByRole("button", { name: `Join ${family.familyName}` }).click();

    // Should redirect to feed after accepting
    await expect(inviteePage.getByRole("heading", { name: "Feed" })).toBeVisible();

    await inviteeContext.close();
  });
});
