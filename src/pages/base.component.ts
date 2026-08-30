import type { Locator, Page } from '@playwright/test';

/**
 * Base class for reusable UI components (header, sidebar, modals, tables…).
 *
 * A component owns a `root` locator and scopes all of its queries to it, so the
 * same component class can be reused wherever the widget appears.
 */
export abstract class BaseComponent {
  readonly root: Locator;

  protected constructor(
    readonly page: Page,
    root: Locator | string,
  ) {
    this.root = typeof root === 'string' ? page.locator(root) : root;
  }

  async isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }

  async waitUntilVisible(timeout?: number): Promise<void> {
    await this.root.waitFor({ state: 'visible', timeout });
  }
}
