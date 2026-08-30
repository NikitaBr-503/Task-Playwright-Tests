import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { BaseComponent } from '../base.component';

/**
 * The "…" overflow menu in a document header (`.more-button`).
 */
export class MoreActionsMenuComponent extends BaseComponent {
  readonly content = this.page.locator('.pc-dropdown-content .more-actions');

  constructor(page: Page) {
    super(page, '.more-button');
  }

  action(name: string): Locator {
    return this.content.getByRole('button', { name, exact: true });
  }

  async open(): Promise<void> {
    if (await this.content.isVisible().catch(() => false)) return;
    await this.root.first().click();
    await expect(this.content).toBeVisible();
  }

  async clickAction(name: string): Promise<void> {
    await this.open();
    const action = this.action(name);
    await expect(action).toBeVisible();
    await action.click();
  }
}
