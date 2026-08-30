import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import type { Credentials } from '@config/env';
import { Routes } from '@data/routes';

import { BasePage } from './base.page';
import { CookieConsentBanner } from './components/cookie-consent.component';

export class LoginPage extends BasePage {
  protected readonly path = Routes.login;

  readonly form = this.page.locator('#login_form');
  readonly emailInput = this.page.locator('#username');
  readonly passwordInput = this.page.locator('#password');
  readonly submitButton = this.page.locator('button.login-form__submit');
  readonly cookieBanner = new CookieConsentBanner(this.page);

  protected readonly pageLoadedLocator = this.form;

  constructor(page: Page) {
    super(page);
  }

  override async open(): Promise<void> {
    await super.open();
    await this.cookieBanner.dismiss();
  }

  /** Fill the form and submit, without asserting the outcome. */
  async submitCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.submitButton.click()]);
  }

  /**
   * Full happy-path sign-in: open the page, authenticate, and wait until the
   * app has navigated away from `/login`.
   */
  async login(credentials: Credentials): Promise<void> {
    await this.open();
    await this.submitCredentials(credentials.email, credentials.password);
    await this.expectLoginSucceeded();
  }

  async expectLoginSucceeded(): Promise<void> {
    await expect(this.page).not.toHaveURL(/\/login/, { timeout: 30_000 });
  }
}
