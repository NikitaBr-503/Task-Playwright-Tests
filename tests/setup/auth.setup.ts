import fs from 'node:fs';

import { expect, test as setup } from '@playwright/test';

import { env } from '@config/env';
import { AUTH_DIR, STORAGE_STATE } from '@config/paths';
import { DashboardPage } from '@pages/dashboard.page';
import { LoginPage } from '@pages/login.page';

/**
 * Signs in once per run and persists the session to `.auth/user.json`.
 */
setup('authenticate as the default user', async ({ page }) => {
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  await loginPage.login(env.credentials);

  await expect(dashboardPage.app).toBeVisible();
  await expect(page).toHaveTitle(/dashboard/i);

  await page.context().storageState({ path: STORAGE_STATE.user });
});
