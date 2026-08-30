import {
  buildPurchaseRequisition,
  documentTotal,
  itemTotal,
  type PurchaseRequisitionData,
} from '@data/purchase-requisition.data';
import { ReferenceData } from '@data/reference-data';
import type { CreatedPurchaseRequisition } from '@flows/purchase-requisition.flow';
import { DocumentStatus } from '@pages/purchase-requisitions/purchase-requisition-details.page';
import { formatAmount } from '@utils/currency';

import { expect, test } from '@fixtures/index';

/**
 * Purchase Requisition — creation.
 *
 * The document is created in a **precondition**, not in the test body: creation
 * is a shared journey (`PurchaseRequisitionFlow.create`) that every future test
 * in this file — editing, revising, rejecting, creating a PO from it — will
 * need. That keeps each test focused on the one behaviour it actually asserts.
 */
test.describe('Purchase Requisitions', () => {
  let data: PurchaseRequisitionData;
  let created: CreatedPurchaseRequisition;

  test.beforeEach(async ({ purchaseRequisitions }) => {
    // Fresh data per test — the note is generated, so runs never collide.
    data = buildPurchaseRequisition();
    created = await purchaseRequisitions.create(data);
  });

  test('a created Purchase Requisition persists every submitted value @smoke', async ({
    prListPage,
    prDetailsPage,
  }) => {
    const [item] = data.items;
    expect(item, 'test data must define at least one item').toBeDefined();
    if (!item) return;

    await test.step('open the Purchase Requisitions list', async () => {
      await prListPage.open();
    });

    await test.step('find and open the created document', async () => {
      await expect(prListPage.row(created.number)).toBeVisible();
      await prListPage.openDocument(created.number);
      await prDetailsPage.waitUntilLoaded();
    });

    await test.step('document identity and status', async () => {
      await expect(prDetailsPage.documentTitle).toContainText(`#${created.number}`);
      await expect(prDetailsPage.statusBadge).toHaveText(DocumentStatus.approved);
    });

    await test.step('header values match what was submitted', async () => {
      await prDetailsPage.expectInfo('Location', data.location);
      await prDetailsPage.expectInfo('Departments', data.department);
      await prDetailsPage.expectInfo('Delivery Date', data.deliveryDate);
      await expect(prDetailsPage.noteBlock).toContainText(data.note);
    });

    await test.step('the item row matches what was entered', async () => {
      const row = prDetailsPage.itemRowByName(item.name);
      await expect(row).toBeVisible();
      await expect(row).toContainText(item.name);
      await expect(row).toContainText(String(item.quantity));
      await expect(row).toContainText(formatAmount(item.price));
      await expect(row).toContainText(formatAmount(itemTotal(item)));
      await expect(row).toContainText(item.supplier);
      await expect(row).toContainText(item.category);
    });

    await test.step('document total is the sum of its items', async () => {
      const total = prDetailsPage.infoBlock('Total');
      await expect(total).toContainText(formatAmount(documentTotal(data)));
      await expect(total).toContainText(ReferenceData.currency);
    });
  });
});
