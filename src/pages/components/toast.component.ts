import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { BaseComponent } from '../base.component';

/**
 * Transient toast notifications (`div.toast`).
 *
 * These auto-dismiss after a few seconds, so assert on them immediately after
 * the action that raises one — never after an intervening navigation or a fixed
 * wait, or the toast will be gone before the assertion runs.
 */
export class ToastComponent extends BaseComponent {
  readonly success = this.page.locator('.toast.success');

  constructor(page: Page) {
    super(page, '.toast');
  }

  async expectSuccess(message: string | RegExp): Promise<void> {
    await expect(this.success.filter({ hasText: message }).first()).toBeVisible();
  }
}
