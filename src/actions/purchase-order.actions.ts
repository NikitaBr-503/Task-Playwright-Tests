import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import type { PurchaseOrderData } from '@data/purchase-order.data';
import { PurchaseOrderCreatePage } from '@pages/purchase-orders/purchase-order-create.page';
import {
  PurchaseOrderDetailsPage,
  SupplierSendStatus,
} from '@pages/purchase-orders/purchase-order-details.page';
import { PurchaseRequisitionDetailsPage } from '@pages/purchase-requisitions/purchase-requisition-details.page';

export interface CreatedPurchaseOrder {
  id: string;
  number: string;
  data: PurchaseOrderData;
}

/**
 * Business actions for Purchase Orders.
 *
 * Orders are always raised from an approved requisition, so this action takes a
 * requisition id and drives: open → Create Purchase Order → fill → Create.
 * Confirming is left to the caller, because the confirmation toast has to be
 * asserted the instant it appears.
 */
export class PurchaseOrderActions {
  private readonly requisitionPage: PurchaseRequisitionDetailsPage;
  private readonly createPage: PurchaseOrderCreatePage;
  private readonly detailsPage: PurchaseOrderDetailsPage;

  constructor(page: Page) {
    this.requisitionPage = new PurchaseRequisitionDetailsPage(page);
    this.createPage = new PurchaseOrderCreatePage(page);
    this.detailsPage = new PurchaseOrderDetailsPage(page);
  }

  /**
   * Create (but do not confirm) a Purchase Order from an approved requisition.
   *
   * Returns the new order in Draft, with the supplier not yet notified.
   */
  async createFromRequisition(
    requisitionId: string,
    data: PurchaseOrderData,
  ): Promise<CreatedPurchaseOrder> {
    // TC-PO-001 step 1 — open the source requisition.
    await this.requisitionPage.openById(requisitionId);

    // TC-PO-001 step 2 — start the order.
    await expect(this.requisitionPage.createPurchaseOrderButton).toBeVisible();
    await this.requisitionPage.createPurchaseOrderButton.click();
    await this.createPage.waitUntilLoaded();

    // TC-PO-001 steps 3-6 — fill and submit.
    await this.createPage.fillForm(data);
    await this.createPage.clickCreate();
    await this.detailsPage.waitUntilLoaded();

    // TC-PO-001 step 7 — a freshly created order has not reached the supplier yet.
    await this.detailsPage.expectSupplierSendStatus(SupplierSendStatus.notSent);

    return {
      id: this.detailsPage.documentId(),
      number: await this.detailsPage.documentNumber(),
      data,
    };
  }
}
