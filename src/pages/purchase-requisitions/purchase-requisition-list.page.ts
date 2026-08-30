import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { Routes } from '@data/routes';

import { BasePage } from '../base.page';

/**
 * Purchase Requisitions list — `/purchase/requisition`.
 */
export class PurchaseRequisitionListPage extends BasePage {
  protected readonly path = Routes.purchaseRequisitions;

  readonly createButton = this.page.locator('a.entity_template_btn');
  readonly rows = this.page.locator('tr.clickable');

  protected readonly pageLoadedLocator = this.createButton;

  constructor(page: Page) {
    super(page);
  }

  /** Row for a given document number, matched on the leading `#` cell. */
  row(documentNumber: string): Locator {
    return this.rows.filter({
      has: this.page.locator('td').first().getByText(documentNumber, { exact: true }),
    });
  }

  /** Row whose link points at a specific document id. */
  rowById(id: string): Locator {
    return this.rows.filter({ has: this.page.locator(`a[href*="/purchase/requisition/${id}/"]`) });
  }

  async clickCreate(): Promise<void> {
    await this.createButton.click();
    await expect(this.page).toHaveURL(/\/purchase\/requisition\/create\/manual/);
  }

  async openDocument(documentNumber: string): Promise<void> {
    const row = this.row(documentNumber);
    await expect(row).toBeVisible();
    await row.click();
    await expect(this.page).toHaveURL(/\/purchase\/requisition\/\d+\/show/);
  }

  async rowCount(): Promise<number> {
    return this.rows.count();
  }
}
