import type { Page } from '@playwright/test';

import { Routes } from '@data/routes';

import { BasePage } from './base.page';

/**
 * Dashboard — the landing page after a successful sign-in.
 *
 * The auth setup asserts on this page to prove a sign-in succeeded.
 */
export class DashboardPage extends BasePage {
  protected readonly path = Routes.dashboard;

  readonly app = this.page.locator('#DashboardApp');
  protected readonly pageLoadedLocator = this.app;

  constructor(page: Page) {
    super(page);
  }
}
