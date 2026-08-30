import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Shared behaviour for every Page Object.
 *
 * Subclasses declare their own `path` and `pageLoadedLocator`; the base class
 * provides navigation, readiness checks and a few cross-cutting helpers so the
 * concrete pages stay focused on their own locators and actions.
 */
export abstract class BasePage {
  protected constructor(readonly page: Page) {}

  /** Route relative to `baseURL`, e.g. `/purchase-orders`. */
  protected abstract readonly path: string;

  /** Element that proves the page finished rendering. */
  protected abstract readonly pageLoadedLocator: Locator;

  /** Navigate to this page and wait until it is ready. */
  async open(searchParams: Record<string, string> = {}): Promise<void> {
    const query = new URLSearchParams(searchParams).toString();
    await this.page.goto(query ? `${this.path}?${query}` : this.path);
    await this.waitUntilLoaded();
  }

  async waitUntilLoaded(): Promise<void> {
    await expect(this.pageLoadedLocator).toBeVisible();
  }
}
