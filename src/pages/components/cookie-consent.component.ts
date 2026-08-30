import type { Page } from '@playwright/test';

import { BaseComponent } from '../base.component';

/**
 * Termly cookie-consent banner.
 */
export class CookieConsentBanner extends BaseComponent {
  readonly acceptButton = this.root.locator('.t-acceptAllButton');
  readonly declineButton = this.root.locator('.t-declineButton');
  readonly preferencesButton = this.root.locator('.t-preference-button');

  constructor(page: Page) {
    super(page, '.termly-styles-module-root-aecb0e, [id*="termly"], .t-consentPrompt');
  }

  /**
   * Dismiss the banner if it is present. Safe to call unconditionally - it
   * resolves quietly when no banner rendered.
   */
  async dismiss(action: 'accept' | 'decline' = 'decline'): Promise<void> {
    const button = action === 'accept' ? this.acceptButton : this.declineButton;

    if (
      !(await button
        .first()
        .isVisible({ timeout: 3_000 })
        .catch(() => false))
    )
      return;

    await button.first().click();
    await this.root
      .first()
      .waitFor({ state: 'hidden', timeout: 5_000 })
      .catch(() => {
        /* Some builds remove the node outright — either outcome is fine. */
      });
  }
}
