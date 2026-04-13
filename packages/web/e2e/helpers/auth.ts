import type { Page } from "@playwright/test";

const LOCAL_STORAGE_KEY = "family-app-current-user";

interface UserInfo {
  id: string;
  displayName: string;
  phone: string;
}

/**
 * Configures a Playwright page so that the app treats the session as the given user.
 *
 * In local auth mode the app reads `family-app-current-user` from localStorage and
 * the GraphQL provider sets `x-user-id` header from that value.
 *
 * Must be called BEFORE navigating to the app (before `page.goto`).
 */
export async function loginAs(
  page: Page,
  userId: string,
  displayName = "Test User",
  phone = "+910000000000",
): Promise<void> {
  const user: UserInfo = { id: userId, displayName, phone };

  // Write localStorage before the page loads so AuthProvider picks it up
  await page.addInitScript(
    ({ key, value }: { key: string; value: string }) => {
      window.localStorage.setItem(key, value);
    },
    { key: LOCAL_STORAGE_KEY, value: JSON.stringify(user) },
  );
}

/**
 * Logs in as demo user Mickey Mouse (user-1).
 */
export async function loginAsMickey(page: Page): Promise<void> {
  await loginAs(page, "user-1", "Mickey Mouse", "+919876543210");
}

/**
 * Logs in as demo user Bart Simpson (user-2).
 */
export async function loginAsBart(page: Page): Promise<void> {
  await loginAs(page, "user-2", "Bart Simpson", "+919876543211");
}
