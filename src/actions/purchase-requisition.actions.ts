import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import type { PurchaseRequisitionData } from '@data/purchase-requisition.data';
import { SidebarComponent } from '@components/sidebar.component';
import { PurchaseRequisitionCreatePage } from '@pages/purchase-requisitions/purchase-requisition-create.page';
import {
  DocumentStatus,
  PurchaseRequisitionDetailsPage,
} from '@pages/purchase-requisitions/purchase-requisition-details.page';
import { PurchaseRequisitionListPage } from '@pages/purchase-requisitions/purchase-requisition-list.page';

/** Identity of a document the action just created. */
export interface CreatedPurchaseRequisition {
  id: string;
  number: string;
  data: PurchaseRequisitionData;
}

/**
 * Business actions for Purchase Requisitions.
 *
 * An action class stitches page objects together into a complete user journey. Keeping
 * it out of the specs means the journey can be a one-line **precondition** for
 * any test that needs an existing document, instead of being copy-pasted:
 *
 * ```ts
 * test.beforeEach(async ({ purchaseRequisitions }) => {
 *   created = await purchaseRequisitions.create(buildPurchaseRequisition());
 * });
 * ```
 *
 * The assertions inside `create()` are deliberate: a precondition that half-way
 * fails must fail loudly and immediately, rather than leaving the actual test to
 * report a confusing downstream error.
 */
export class PurchaseRequisitionActions {
  private readonly sidebar: SidebarComponent;
  private readonly listPage: PurchaseRequisitionListPage;
  private readonly createPage: PurchaseRequisitionCreatePage;
  private readonly detailsPage: PurchaseRequisitionDetailsPage;

  constructor(private readonly page: Page) {
    this.sidebar = new SidebarComponent(page);
    this.listPage = new PurchaseRequisitionListPage(page);
    this.createPage = new PurchaseRequisitionCreatePage(page);
    this.detailsPage = new PurchaseRequisitionDetailsPage(page);
  }

  /**
   * Create and confirm a Purchase Requisition end to end, through the UI only.
   *
   * Navigate → fill header → add one item per `data.items` → confirm.
   * Returns the new document's id and number.
   */
  async create(data: PurchaseRequisitionData): Promise<CreatedPurchaseRequisition> {
    // TC-PR-001 step 1 — navigate to Purchase Requisitions from the left rail.
    await this.page.goto('/');
    await this.sidebar.navigateTo('Purchase Requisitions');
    await this.listPage.waitUntilLoaded();

    // TC-PR-001 step 2 — start a new document.
    await this.listPage.clickCreate();
    await this.createPage.waitUntilLoaded();

    // TC-PR-001 steps 3-4 — fill the header and submit; this persists the Draft.
    await this.createPage.fillForm(data);
    await this.createPage.clickNextStep();
    await this.detailsPage.waitUntilLoaded();
    await this.detailsPage.expectStatus(DocumentStatus.draft);

    // TC-PR-001 steps 5-7 — add each item and verify it landed in the table.
    for (const item of data.items) {
      await this.detailsPage.addNewItem(item);
      await this.detailsPage.saveItem();
      await expect(this.detailsPage.itemRowByName(item.name)).toBeVisible();
    }
    expect(await this.detailsPage.itemCount()).toBe(data.items.length);

    // TC-PR-001 steps 8-10 — confirm the document and verify it left Draft.
    const id = this.detailsPage.documentId();
    const number = await this.detailsPage.documentNumber();

    await this.detailsPage.confirmDocument();
    await expect(this.detailsPage.statusBadge).not.toHaveText(DocumentStatus.draft);

    return { id, number, data };
  }
}
