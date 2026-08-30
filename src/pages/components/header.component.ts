import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { BaseComponent } from '../base.component';

/**
 * Top bar (`.header`): logo, help centre, and the account dropdown that holds
 * profile links and Log Out.
 */
export class HeaderComponent extends BaseComponent {
  readonly logo = this.root.locator('.logo');
  readonly burger = this.page.locator('#hamburger-icon');
  readonly helpCenterLink = this.page.locator('.topbar-menu__link');

  readonly accountMenu = this.page.locator('.topbar__account');
  readonly accountDropdown = this.page.locator('.topbar__account__dropdown-list');
  readonly accountDropdownItems = this.page.locator('a.topbar__account__dropdown-item');

  readonly profileSettingsLink = this.accountDropdownItems.filter({ hasText: 'Profile Settings' });
  readonly changePasswordLink = this.accountDropdownItems.filter({ hasText: 'Change Password' });
  readonly emailPreferencesLink = this.accountDropdownItems.filter({
    hasText: 'Email Preferences',
  });
  readonly logoutLink = this.accountDropdownItems.filter({ hasText: 'Log Out' });

  constructor(page: Page) {
    super(page, '.header');
  }

  async openAccountMenu(): Promise<void> {
    if (await this.accountDropdown.isVisible().catch(() => false)) return;
    await this.accountMenu.click();
    await expect(this.accountDropdown).toBeVisible();
  }

  /** Email of the signed-in user, as shown at the top of the account menu. */
  async signedInEmail(): Promise<string> {
    await this.openAccountMenu();
    const first = this.page.locator('.topbar__account__dropdown-list__item').first();
    return (await first.innerText()).trim();
  }

  async logout(): Promise<void> {
    await this.openAccountMenu();
    await this.logoutLink.click();
    await expect(this.page).toHaveURL(/\/login/);
  }
}
