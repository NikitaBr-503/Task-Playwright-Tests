import {
  buildPurchaseRequisition,
  documentTotal,
  generateCancelReason,
  itemTotal,
  type PurchaseRequisitionData,
} from '@data/purchase-requisition.data';
import { ReferenceData } from '@data/reference-data';
import type { CreatedPurchaseRequisition } from '@actions/purchase-requisition.actions';
import {
  CANCELED_MESSAGE,
  DocumentStatus,
  MoreAction,
} from '@pages/purchase-requisitions/purchase-requisition-details.page';
import { formatAmount } from '@utils/currency';

import { expect, test } from '@fixtures/index';

/**
 * Purchase Requisition — creation.
 */
test.describe('Purchase Requisitions tests', () => {
  let data: PurchaseRequisitionData;
  let created: CreatedPurchaseRequisition;

  test.beforeEach(async ({ purchaseRequisitions }) => {
    // Fresh data per test — the note is generated, so runs never collide.
    data = buildPurchaseRequisition();
    created = await purchaseRequisitions.create(data);
  });

  test('Verify that a created Purchase Requisition persists every submitted value @smoke', async ({
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

  test('Verify thatan approved Purchase Requisition can be marked as completed @regression', async ({
    prListPage,
    prDetailsPage,
  }) => {
    await test.step('open the created requisition', async () => {
      // Steps 1-2 — step 1 is the shared precondition above.
      await prDetailsPage.openById(created.id);
      await expect(prDetailsPage.statusBadge).toHaveText(DocumentStatus.approved);
    });

    await test.step('complete it from the "…" menu', async () => {
      // Steps 3-4. Completing is offered only in the header overflow menu.
      await prDetailsPage.moreActions.open();
      await expect(prDetailsPage.moreActions.action(MoreAction.markAsCompleted)).toBeVisible();
      await prDetailsPage.markAsCompleted();
    });

    await test.step('the document reports Completed', async () => {
      // Step 5.
      await prDetailsPage.expectStatus(DocumentStatus.completed);
    });

    await test.step('the list reports Completed too', async () => {
      // Steps 6-7 — the status has to survive a round trip, not just re-render.
      await prListPage.open();
      await expect(prListPage.rowStatus(created.number)).toHaveText(DocumentStatus.completed);
    });
  });

  test('Verify that a Purchase Requisition can be canceled with a reason @regression', async ({
    prListPage,
    prDetailsPage,
  }) => {
    const reason = generateCancelReason();

    await test.step('open the created requisition', async () => {
      // Steps 1-2 — step 1 is the shared precondition above.
      await prDetailsPage.openById(created.id);
      await expect(prDetailsPage.statusBadge).toHaveText(DocumentStatus.approved);
    });

    await test.step('cancel it from the "…" menu, giving a reason', async () => {
      // Steps 3-6. The dialog keeps "Yes" disabled until the comment is filled,
      // which `confirmWithComment` asserts before submitting.
      await prDetailsPage.moreActions.open();
      await expect(prDetailsPage.moreActions.action(MoreAction.cancelDocument)).toBeEnabled();
      await prDetailsPage.cancelDocument(reason);
    });

    await test.step('the cancellation is reported', async () => {
      // Step 7 — transient toast, asserted immediately after the action.
      await prDetailsPage.toast.expectSuccess(CANCELED_MESSAGE);
    });

    await test.step('the document reports Canceled', async () => {
      // Step 8.
      await prDetailsPage.expectStatus(DocumentStatus.canceled);
    });

    await test.step('the list reports Canceled too', async () => {
      // Step 9.
      await prListPage.open();
      await expect(prListPage.rowStatus(created.number)).toHaveText(DocumentStatus.canceled);
    });
  });
});
