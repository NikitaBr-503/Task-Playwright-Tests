import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { BaseComponent } from '../base.component';

/**
 * `.pc-alert-dialog` — the app-wide Yes/Cancel confirmation used by document
 * actions such as Confirm, Delete and Revise.
 */
export class ConfirmDialogComponent extends BaseComponent {
  readonly title = this.root.locator('.pc-alert-dialog__title');
  readonly yesButton = this.root.getByRole('button', { name: 'Yes' });
  readonly cancelButton = this.root.getByRole('button', { name: 'Cancel' });

  constructor(page: Page) {
    super(page, '.pc-alert-dialog');
  }

  async waitUntilOpen(): Promise<void> {
    await expect(this.root).toBeVisible();
  }

  async titleText(): Promise<string> {
    return (await this.title.innerText()).trim();
  }

  async confirm(): Promise<void> {
    await this.waitUntilOpen();
    await this.yesButton.click();
    await expect(this.root).toBeHidden();
  }

  async cancel(): Promise<void> {
    await this.waitUntilOpen();
    await this.cancelButton.click();
    await expect(this.root).toBeHidden();
  }
}
