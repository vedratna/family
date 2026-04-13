import { test as base, type Page } from "@playwright/test";

import { loginAs } from "./auth";
import {
  createTestUser,
  createTestFamily,
  addTestMember,
  acceptTestInvitation,
  type TestUser,
  type TestFamily,
} from "./factories";

interface SeededFamily {
  owner: TestUser;
  member: TestUser;
  family: TestFamily;
  memberPersonId: string;
}

/**
 * Extended Playwright test with common fixtures.
 *
 * - `seededFamily` creates two users, a family, and adds the second user as a member.
 *   Returns all IDs needed for tests that require a populated family.
 *
 * - `authedPage` provides a page already logged in as the seeded family owner.
 */
export const test = base.extend<{
  seededFamily: SeededFamily;
  authedPage: Page;
}>({
  // eslint-disable-next-line no-empty-pattern
  seededFamily: async ({}, use, testInfo) => {
    const owner = await createTestUser(testInfo.workerIndex, "Owner");
    const family = await createTestFamily(owner.id, `E2E Family ${String(Date.now())}`);

    const member = await createTestUser(testInfo.workerIndex, "Member");
    await addTestMember(owner.id, family.familyId, member.phone, member.displayName);

    const { personId: memberPersonId } = await acceptTestInvitation(
      member.id,
      family.familyId,
      member.phone,
      member.displayName,
    );

    await use({ owner, member, family, memberPersonId });
  },

  authedPage: async ({ page, seededFamily }, use) => {
    await loginAs(
      page,
      seededFamily.owner.id,
      seededFamily.owner.displayName,
      seededFamily.owner.phone,
    );
    await use(page);
  },
});

export { expect } from "@playwright/test";
