import type { Locator, Page, Response } from '@playwright/test';
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

  async isLoaded(): Promise<boolean> {
    return this.pageLoadedLocator.isVisible();
  }

  // ---- Small shared helpers -------------------------------------------------

  async reload(): Promise<Response | null> {
    const response = await this.page.reload();
    await this.waitUntilLoaded();
    return response;
  }

  async title(): Promise<string> {
    return this.page.title();
  }

  get url(): string {
    return this.page.url();
  }

  /**
   * Wait for the network to settle, bounded so a long-polling or analytics
   * request can never hang the whole test.
   */
  async waitForNetworkIdle(timeout = 10_000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout }).catch(() => {
      /* Best effort — a chatty app should not fail the test here. */
    });
  }

  /** Attach a named screenshot to the current test report. */
  async screenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }
}
