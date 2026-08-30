import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import type { PurchaseRequisitionItemData } from '@data/purchase-requisition.data';
import { Routes } from '@data/routes';
import { exactText } from '@utils/text';

import { BasePage } from '../base.page';
import { ConfirmDialogComponent } from '../components/confirm-dialog.component';
import { MoreActionsMenuComponent } from '../components/more-actions-menu.component';
import { PcSelectComponent } from '../components/pc-select.component';
import { ToastComponent } from '../components/toast.component';

export const DocumentStatus = {
  draft: 'Draft',
  approved: 'Approved',
  completed: 'Completed',
  canceled: 'Canceled',
} as const;

export const CANCELED_MESSAGE = 'The document has been canceled.';

export const MoreAction = {
  markAsCompleted: 'Mark as completed',
  cancelDocument: 'Cancel Document',
} as const;

export type DocumentStatusValue = (typeof DocumentStatus)[keyof typeof DocumentStatus];

export class PurchaseRequisitionDetailsPage extends BasePage {
  protected readonly path = Routes.purchaseRequisitions;

  readonly header = this.page.locator('.new-document-header');
  readonly documentTitle = this.header.getByRole('heading').first();
  readonly statusBadge = this.page.locator('.document-statuses .status-badge').first();

  readonly itemRows = this.page.locator('.document-items-table-row');
  readonly editingRow = this.page.locator('.document-items-table-row.active-row');

  readonly addNewItemButton = this.page.getByRole('button', { name: 'Add New Item' });
  readonly confirmButton = this.page.getByRole('button', { name: 'Confirm', exact: true });

  readonly createPurchaseOrderButton = this.page.getByRole('button', {
    name: 'Create Purchase Order',
  });
  readonly confirmDialog = new ConfirmDialogComponent(this.page);
  readonly moreActions = new MoreActionsMenuComponent(this.page);
  readonly toast = new ToastComponent(this.page);

  readonly noteBlock = this.page
    .locator('.document-info-block')
    .filter({ has: this.page.locator('.info-label', { hasText: /^\s*Note/ }) });

  protected readonly pageLoadedLocator = this.header;

  constructor(page: Page) {
    super(page);
  }

  override async open(): Promise<void> {
    throw new Error('Open a specific document with openById(id) instead.');
  }

  async openById(id: string): Promise<void> {
    await this.page.goto(`/purchase/requisition/${id}/show`);
    await this.waitUntilLoaded();
  }

  // ---- Identity -------------------------------------------------------------

  /** Document number without the `#`, e.g. `11`. */
  async documentNumber(): Promise<string> {
    const text = await this.documentTitle.innerText();
    const match = text.match(/#?\s*(\d+)\s*$/);
    if (!match?.[1]) throw new Error(`Could not read a document number from "${text}"`);
    return match[1];
  }

  /** Document id from the URL. */
  documentId(): string {
    const match = this.page.url().match(/\/purchase\/requisition\/(\d+)\/show/);
    if (!match?.[1]) throw new Error(`Not on a document details URL: ${this.page.url()}`);
    return match[1];
  }

  // ---- Header info block ----------------------------------------------------

  /**
   * The label/value pair block for a header field, e.g. `infoBlock('Location')`.
   * Matching is anchored because "Creation Date", "Approval Date" and
   * "Delivery Date" all share a substring.
   */
  infoBlock(label: string): Locator {
    return this.page
      .locator('.document-info-block')
      .filter({ has: this.page.locator('.info-label', { hasText: exactText(label) }) });
  }

  async expectInfo(label: string, value: string): Promise<void> {
    await expect(this.infoBlock(label)).toContainText(value);
  }

  // ---- Items ----------------------------------------------------------------

  /** Row matched by its item name — order-independent. */
  itemRowByName(name: string): Locator {
    return this.itemRows.filter({
      has: this.page.locator('.sku-name-desc-cell', { hasText: name }),
    });
  }

  async itemCount(): Promise<number> {
    return this.itemRows.count();
  }

  async addNewItem(item: PurchaseRequisitionItemData): Promise<void> {
    await this.addNewItemButton.click();
    await expect(this.editingRow).toBeVisible();

    const row = this.editingRow;
    await row.locator('textarea[name="item_name"]').fill(item.name);
    await row.locator('input[name="item_ordered"]').fill(String(item.quantity));
    await row.locator('input[name="item_price"]').fill(String(item.price));

    await new PcSelectComponent(
      this.page,
      row.locator('.supplier-cell .pc-select').first(),
    ).selectOption(item.supplier);

    await new PcSelectComponent(
      this.page,
      row.locator('.icf-cell .pc-select').first(),
    ).selectOption(item.category);
  }

  /** Click the checkmark in the Action column to commit the edited row. */
  async saveItem(): Promise<void> {
    await this.editingRow.locator('button.action-button.save').click();
    await expect(this.editingRow).toBeHidden();
  }

  async confirmDocument(): Promise<void> {
    await this.confirmButton.click();
    await this.confirmDialog.confirm();
  }

  async markAsCompleted(): Promise<void> {
    await this.moreActions.clickAction(MoreAction.markAsCompleted);
    await this.confirmDialog.confirm();
  }

  async cancelDocument(reason: string): Promise<void> {
    await this.moreActions.clickAction(MoreAction.cancelDocument);
    await this.confirmDialog.confirmWithComment(reason);
  }

  async expectStatus(status: DocumentStatusValue): Promise<void> {
    await expect(this.statusBadge).toHaveText(exactText(status));
  }
}
