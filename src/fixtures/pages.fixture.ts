import { test as base } from '@playwright/test';

import { PurchaseOrderActions } from '@actions/purchase-order.actions';
import { PurchaseRequisitionActions } from '@actions/purchase-requisition.actions';
import { PurchaseOrderDetailsPage } from '@pages/purchase-orders/purchase-order-details.page';
import { PurchaseOrderListPage } from '@pages/purchase-orders/purchase-order-list.page';
import { PurchaseRequisitionDetailsPage } from '@pages/purchase-requisitions/purchase-requisition-details.page';
import { PurchaseRequisitionListPage } from '@pages/purchase-requisitions/purchase-requisition-list.page';

/**
 * Page Objects and action classes injected into every test.
 *
 * Register a page here once and it becomes available by name in any spec:
 *   `test('…', async ({ prListPage }) => { … })`
 *
 * Only pages specs actually reach for live here. Pages driven solely from
 * within an action class (the create forms) are constructed there instead, and
 * `LoginPage` / `DashboardPage` are constructed directly by the auth setup —
 * a fixture nothing destructures is just an unused registration.
 */
export interface PageFixtures {
  prListPage: PurchaseRequisitionListPage;
  prDetailsPage: PurchaseRequisitionDetailsPage;

  poListPage: PurchaseOrderListPage;
  poDetailsPage: PurchaseOrderDetailsPage;

  /** End-to-end journeys, usable as test preconditions. */
  purchaseRequisitions: PurchaseRequisitionActions;
  purchaseOrders: PurchaseOrderActions;
}

export const test = base.extend<PageFixtures>({
  prListPage: async ({ page }, use) => {
    await use(new PurchaseRequisitionListPage(page));
  },
  prDetailsPage: async ({ page }, use) => {
    await use(new PurchaseRequisitionDetailsPage(page));
  },

  poListPage: async ({ page }, use) => {
    await use(new PurchaseOrderListPage(page));
  },
  poDetailsPage: async ({ page }, use) => {
    await use(new PurchaseOrderDetailsPage(page));
  },

  purchaseRequisitions: async ({ page }, use) => {
    await use(new PurchaseRequisitionActions(page));
  },
  purchaseOrders: async ({ page }, use) => {
    await use(new PurchaseOrderActions(page));
  },
});
