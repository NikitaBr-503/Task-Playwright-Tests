import fs from 'node:fs';

import { expect, test as setup } from '@playwright/test';

import { AUTH_DIR, STORAGE_STATE } from '@config/paths';
import { users } from '@data/users';
import { DashboardPage } from '@pages/dashboard.page';
import { LoginPage } from '@pages/login.page';

/**
 * Signs in once per run and persists the session to `.auth/user.json`.
 *
 * Every UI project declares `dependencies: ['setup']` and reuses that state, so
 * the suite performs exactly one login no matter how many specs run. This also
 * keeps us well clear of Precoro's login throttle (6 failed attempts locks the
 * account for 30 minutes).
 */
setup('authenticate as the default user', async ({ page }) => {
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  await loginPage.login(users.user);

  await expect(dashboardPage.app).toBeVisible();
  await expect(page).toHaveTitle(/dashboard/i);

  await page.context().storageState({ path: STORAGE_STATE.user });
});
