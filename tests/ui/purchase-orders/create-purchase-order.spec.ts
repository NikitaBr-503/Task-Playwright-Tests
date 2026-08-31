import {
  buildPurchaseOrder,
  grossTotal,
  taxAmount,
  type PurchaseOrderData,
} from '@data/purchase-order.data';
import {
  buildPurchaseRequisition,
  documentTotal,
  type PurchaseRequisitionData,
} from '@data/purchase-requisition.data';
import { ReferenceData } from '@data/reference-data';
import type { CreatedPurchaseRequisition } from '@actions/purchase-requisition.actions';
import {
  CONFIRMED_AND_SENT_MESSAGE,
  SupplierSendStatus,
} from '@pages/purchase-orders/purchase-order-details.page';
import { formatAmount } from '@utils/currency';

import { expect, test } from '@fixtures/index';

/**
 * Purchase Order — creation from an approved Purchase Requisition.
 */
test.describe('Purchase Orders tests', () => {
  let requisitionData: PurchaseRequisitionData;
  let requisition: CreatedPurchaseRequisition;

  test.beforeEach(async ({ purchaseRequisitions }) => {
    // Step 1 — precondition: an approved requisition to raise the order from.
    requisitionData = buildPurchaseRequisition();
    requisition = await purchaseRequisitions.create(requisitionData);
  });

  test('TC-PO-001 — Verify that a Purchase Order created from a requisition is confirmed and sent to the supplier @smoke', async ({
    purchaseOrders,
    poListPage,
    poDetailsPage,
  }) => {
    const orderData: PurchaseOrderData = buildPurchaseOrder();
    const netTotal = documentTotal(requisitionData);

    const order = await test.step('Steps 1-6 — create the Purchase Order', async () => {
      // Steps 2-5, plus the "Not sent" check the action makes on arrival.
      return purchaseOrders.createFromRequisition(requisition.id, orderData);
    });

    await test.step('Step 7 — the new order is not yet sent to the supplier', async () => {
      // Step 6.
      await expect(poDetailsPage.documentTitle).toHaveText(
        poDetailsPage.titlePattern(order.number),
      );
      await poDetailsPage.expectSupplierSendStatus(SupplierSendStatus.notSent);
    });

    await test.step('Steps 8-10 — confirming reports success', async () => {
      // Steps 7-9. The toast is transient, so it is asserted immediately.
      await poDetailsPage.confirmDocument();
      await poDetailsPage.toast.expectSuccess(CONFIRMED_AND_SENT_MESSAGE);
    });

    await test.step('Step 11 — supplier status flips to Sent', async () => {
      // Step 10.
      await poDetailsPage.expectSupplierSendStatus(SupplierSendStatus.sent);
    });

    await test.step('Step 12 — reopen the order from the Purchase Orders list', async () => {
      await poListPage.open();
      await expect(poListPage.row(order.number)).toBeVisible();
      await poListPage.openDocument(order.number);
      await poDetailsPage.waitUntilLoaded();
    });

    await test.step('Step 13 — the reopened order carries everything provided', async () => {
      const [item] = requisitionData.items;
      expect(item, 'requisition data must define at least one item').toBeDefined();
      if (!item) return;

      await poDetailsPage.expectInfo('Supplier', item.supplier);
      await poDetailsPage.expectInfo('Payment Terms', orderData.paymentTerms);
      await poDetailsPage.expectInfo('Location', requisitionData.location);
      await poDetailsPage.expectInfo('Departments', requisitionData.department);
      await poDetailsPage.expectInfo('Delivery Date', requisitionData.deliveryDate);
      await expect(poDetailsPage.noteBlock).toContainText(orderData.note);

      for (const tax of orderData.taxes) {
        await poDetailsPage.expectInfo('Taxes', tax.label);
      }
    });

    await test.step('Step 14 — totals reflect the requisition value plus tax', async () => {
      await poDetailsPage.expectInfo('Net Total', formatAmount(netTotal));
      await poDetailsPage.expectInfo('Total Tax', formatAmount(taxAmount(netTotal, orderData)));
      await poDetailsPage.expectInfo('Gross Total', formatAmount(grossTotal(netTotal, orderData)));
      await expect(poDetailsPage.infoBlock('Gross Total')).toContainText(ReferenceData.currency);
    });

    await test.step('Step 15 — the order links back to its source requisition', async () => {
      // Step 11 — the relationship is the whole point of this journey.
      await expect(poDetailsPage.relatedRequisitionsBlock).toContainText(`#${requisition.number}`);
      await poDetailsPage.expectSupplierSendStatus(SupplierSendStatus.sent);
    });
  });
});
