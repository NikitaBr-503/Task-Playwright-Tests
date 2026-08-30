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

  /** Variants that demand a reason — cancelling a document, for instance. */
  readonly commentInput = this.root.locator('textarea.pc-textarea');

  constructor(page: Page) {
    super(page, '.pc-alert-dialog');
  }

  async waitUntilOpen(): Promise<void> {
    await expect(this.root).toBeVisible();
  }

  async confirm(): Promise<void> {
    await this.waitUntilOpen();
    await this.yesButton.click();
    await expect(this.root).toBeHidden();
  }

  /**
   * Fill the mandatory comment, then confirm.
   *
   * "Yes" stays disabled until the comment is non-empty, so the enabled check
   * is what proves the reason actually registered.
   */
  async confirmWithComment(comment: string): Promise<void> {
    await this.waitUntilOpen();
    await this.commentInput.fill(comment);
    await expect(this.yesButton).toBeEnabled();
    await this.yesButton.click();
    await expect(this.root).toBeHidden();
  }
}
