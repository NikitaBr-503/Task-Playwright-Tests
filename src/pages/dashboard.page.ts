import type { Page } from '@playwright/test';

import { Routes } from '@data/routes';

import { BasePage } from './base.page';
import { HeaderComponent } from './components/header.component';
import { SidebarComponent } from './components/sidebar.component';

/**
 * Dashboard — the landing page after a successful sign-in.
 *
 * Hosts the "Needs your action" counters and the analytics widget grid, and is
 * the natural entry point to the shared header/sidebar components.
 */
export class DashboardPage extends BasePage {
  protected readonly path = Routes.dashboard;

  readonly app = this.page.locator('#DashboardApp');
  protected readonly pageLoadedLocator = this.app;

  readonly header = new HeaderComponent(this.page);
  readonly sidebar = new SidebarComponent(this.page);

  /** "Needs your action" quick-link cards, e.g. "1 draft", "2 approve". */
  readonly actionCards = this.page.locator('.new-info-card');
  readonly actionTabs = this.page.locator('.el-tabs__nav').first();

  /** Analytics section widgets. */
  readonly widgets = this.page.locator('.dashboard-widget-card-header');

  readonly sessionExpiredPopup = this.page.locator('#sessionExpirePopup');

  constructor(page: Page) {
    super(page);
  }

  async actionCardCount(): Promise<number> {
    return this.actionCards.count();
  }

  async widgetTitles(): Promise<string[]> {
    const titles = await this.widgets.allInnerTexts();
    return titles.map((title) => title.trim()).filter(Boolean);
  }
}
