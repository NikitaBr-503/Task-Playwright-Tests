import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { NavItems, type NavItemLabel } from '@data/routes';
import { escapeRegExp } from '@utils/text';

import { BaseComponent } from '../base.component';

/**
 * Left navigation rail (`.app-nav-list`).
 *
 * The rail renders as an icon-only strip and expands on hover; labels are in
 * the DOM the whole time, so we can locate items by accessible name without
 * having to drive the hover animation.
 */
export class SidebarComponent extends BaseComponent {
  constructor(page: Page) {
    super(page, '.app-nav-list');
  }

  item(label: NavItemLabel) {
    return this.root.getByRole('link', { name: label, exact: true });
  }

  /** Click a nav item and wait for its route to load. */
  async navigateTo(label: NavItemLabel): Promise<void> {
    const target = this.item(label);
    await target.hover();
    await target.click();
    await expect(this.page).toHaveURL(new RegExp(`${escapeRegExp(NavItems[label])}(\\?|$|/)`));
  }
}
