import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import type { TestUser } from '@data/users';

import { BasePage } from './base.page';
import { CookieConsentBanner } from './components/cookie-consent.component';

/**
 * Precoro login screen — https://app.precoro.com/login
 *
 * Selectors are taken from the live markup: the app ships no `data-testid`
 * attributes, so we anchor on stable form ids and semantic roles rather than
 * on layout-driven CSS classes.
 */
export class LoginPage extends BasePage {
  protected readonly path = '/login';

  readonly form = this.page.locator('#login_form');
  readonly emailInput = this.page.locator('#username');
  readonly passwordInput = this.page.locator('#password');
  readonly submitButton = this.page.locator('button.login-form__submit');
  readonly forgotPasswordLink = this.page.getByRole('link', { name: /forgot password/i });

  /** Alternative sign-in routes offered next to the password form. */
  readonly ssoLink = this.page.getByRole('link', { name: /sign in with sso/i });
  readonly googleLink = this.page.getByRole('link', { name: /sign in with google/i });
  readonly xeroLink = this.page.getByRole('link', { name: /sign in with xero/i });
  readonly magicLinkLink = this.page.getByRole('link', { name: /one-time login link/i });

  /** Server-rendered validation / authentication error. */
  readonly errorMessage = this.page.locator(
    '.login-form__error, .alert-danger, [class*="error"]:visible',
  );

  protected readonly pageLoadedLocator = this.form;

  readonly cookieBanner = new CookieConsentBanner(this.page);

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
  async login(user: TestUser): Promise<void> {
    await this.open();
    await this.submitCredentials(user.email, user.password);
    await this.expectLoginSucceeded();
  }

  async expectLoginSucceeded(): Promise<void> {
    await expect(this.page).not.toHaveURL(/\/login/, { timeout: 30_000 });
  }

  async expectLoginFailed(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login/);
    await expect(this.errorMessage.first()).toBeVisible();
  }

  async errorText(): Promise<string> {
    return (await this.errorMessage.first().textContent())?.trim() ?? '';
  }
}
