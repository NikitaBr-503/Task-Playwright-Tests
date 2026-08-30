import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { Routes } from '@data/routes';
import { exactText } from '@utils/text';

import { BasePage } from '../base.page';
import { ConfirmDialogComponent } from '../components/confirm-dialog.component';
import { ToastComponent } from '../components/toast.component';

/** Whether the order has been emailed to the supplier. */
export const SupplierSendStatus = {
  notSent: 'Not sent',
  sent: 'Sent',
} as const;

export type SupplierSendStatusValue = (typeof SupplierSendStatus)[keyof typeof SupplierSendStatus];

/** Message shown once an order is confirmed and dispatched. */
export const CONFIRMED_AND_SENT_MESSAGE =
  'Confirmed successfully. Purchase Order has been sent to the supplier.';

/**
 * Purchase Order details — `/purchase/order/{id}/show`.
 */
export class PurchaseOrderDetailsPage extends BasePage {
  protected readonly path = Routes.purchaseOrders;

  readonly header = this.page.locator('.new-document-header');
  readonly documentTitle = this.header.getByRole('heading').first();
  readonly statusBadge = this.page.locator('.document-statuses .status-badge').first();

  readonly confirmButton = this.page.getByRole('button', { name: 'Confirm', exact: true });
  readonly confirmDialog = new ConfirmDialogComponent(this.page);
  readonly toast = new ToastComponent(this.page);

  /** The Note block is labelled with extra badges, so match on the prefix. */
  readonly noteBlock = this.page
    .locator('.document-info-block')
    .filter({ has: this.page.locator('.info-label', { hasText: /^\s*Note/ }) });

  /** Supplier block — also carries the send-status badge. */
  readonly supplierBlock = this.infoBlock('Supplier');

  /** Back-link block to the requisition(s) this order was raised from. */
  readonly relatedRequisitionsBlock = this.infoBlock('Purchase Requisitions');

  /** Declared after `supplierBlock` — field initializers run in source order. */
  readonly supplierStatusBadge = this.supplierBlock.locator('.status-badge');

  protected readonly pageLoadedLocator = this.header;

  constructor(page: Page) {
    super(page);
  }

  override async open(): Promise<void> {
    throw new Error('Open a specific document with openById(id) instead.');
  }

  async openById(id: string): Promise<void> {
    await this.page.goto(`/purchase/order/${id}/show`);
    await this.waitUntilLoaded();
  }

  // ---- Identity -------------------------------------------------------------

  /**
   * Document number, e.g. `13`. The `#` is rendered separately and does not
   * always survive `innerText`, so it is optional in the match.
   */
  async documentNumber(): Promise<string> {
    const text = await this.documentTitle.innerText();
    const match = text.match(/#?\s*(\d+)\s*$/);
    if (!match?.[1]) throw new Error(`Could not read a document number from "${text}"`);
    return match[1];
  }

  /** Heading matcher tolerant of the optional `#`. */
  titlePattern(documentNumber: string): RegExp {
    return new RegExp(`Purchase Order\\s*#?\\s*${documentNumber}\\s*$`);
  }

  documentId(): string {
    const match = this.page.url().match(/\/purchase\/order\/(\d+)\/show/);
    if (!match?.[1]) throw new Error(`Not on a Purchase Order details URL: ${this.page.url()}`);
    return match[1];
  }

  // ---- Header info blocks ---------------------------------------------------

  /**
   * The label/value pair block for a header field.
   *
   * Safe to call from the field initializers above: prototype methods exist
   * before any instance field runs.
   */
  infoBlock(label: string): Locator {
    return this.page
      .locator('.document-info-block')
      .filter({ has: this.page.locator('.info-label', { hasText: exactText(label) }) });
  }

  async expectInfo(label: string, value: string): Promise<void> {
    await expect(this.infoBlock(label)).toContainText(value);
  }

  // ---- Supplier send status -------------------------------------------------

  async expectSupplierSendStatus(status: SupplierSendStatusValue): Promise<void> {
    await expect(this.supplierStatusBadge.filter({ hasText: exactText(status) })).toBeVisible();
  }

  // ---- Actions --------------------------------------------------------------

  /**
   * Click Confirm and accept the dialog.
   *
   * Deliberately does not wait afterwards: the success toast is transient, so
   * the caller must assert on it immediately.
   */
  async confirmDocument(): Promise<void> {
    await this.confirmButton.click();
    await this.confirmDialog.confirm();
  }
}
