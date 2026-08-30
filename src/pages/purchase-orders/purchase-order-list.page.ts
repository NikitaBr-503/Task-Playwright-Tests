import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { Routes } from '@data/routes';

import { BasePage } from '../base.page';

/**
 * Purchase Orders list — `/purchase/order`.
 */
export class PurchaseOrderListPage extends BasePage {
  protected readonly path = Routes.purchaseOrders;

  readonly heading = this.page.getByRole('heading', { name: 'Purchase Orders', level: 1 });
  readonly rows = this.page.locator('tr.clickable');

  protected readonly pageLoadedLocator = this.heading;

  constructor(page: Page) {
    super(page);
  }

  /** Row for a document number, matched on the leading `# / Type` cell. */
  row(documentNumber: string): Locator {
    return this.rows.filter({
      has: this.page.locator('td').first().getByText(documentNumber, { exact: true }),
    });
  }

  async openDocument(documentNumber: string): Promise<void> {
    const row = this.row(documentNumber);
    await expect(row).toBeVisible();
    await row.click();
    await expect(this.page).toHaveURL(/\/purchase\/order\/\d+\/show/);
  }
}
