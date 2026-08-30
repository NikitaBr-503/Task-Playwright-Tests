import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import type { PurchaseOrderData } from '@data/purchase-order.data';
import { Routes } from '@data/routes';
import { exactText } from '@utils/text';

import { BasePage } from '../base.page';
import { PcSelectComponent } from '../components/pc-select.component';
import { RichTextEditorComponent } from '../components/rich-text-editor.component';

/**
 * Purchase Order creation form, reached from an approved Purchase Requisition:
 * `/purchase/order/create/from_requests?purchaseRequisitionIdn={number}`.
 *
 * Supplier, location, department and delivery date arrive prefilled from the
 * source requisition — only payment terms, taxes and the note are entered here.
 */
export class PurchaseOrderCreatePage extends BasePage {
  protected readonly path = Routes.createPurchaseOrder;

  readonly form = this.page.locator('.create-document-form');
  readonly createButton = this.page.getByRole('button', { name: 'Create', exact: true });
  readonly note = new RichTextEditorComponent(this.page);

  readonly paymentTermsSelect = new PcSelectComponent(
    this.page,
    this.field('Payment Terms').locator('.pc-select').first(),
  );

  /** Taxes is a checkbox multi-select, not a single-choice list. */
  readonly taxesSelect = new PcSelectComponent(
    this.page,
    this.field('Taxes').locator('.pc-select').first(),
  );

  protected readonly pageLoadedLocator = this.form;

  constructor(page: Page) {
    super(page);
  }

  /**
   * A labelled field wrapper, e.g. `field('Taxes')`.
   *
   * Safe to call from the field initializers above: prototype methods exist
   * before any instance field runs.
   */
  private field(label: string): Locator {
    return this.page
      .locator('.create-form-element')
      .filter({ has: this.page.locator('.form-label-text', { hasText: label }) });
  }

  async fillForm(data: PurchaseOrderData): Promise<void> {
    await this.paymentTermsSelect.selectOption(data.paymentTerms);

    for (const tax of data.taxes) {
      await this.taxesSelect.checkOption(tax.label);
    }
    await this.taxesSelect.close();

    await this.note.setText(data.note);

    await expect(this.paymentTermsSelect.value.first()).toHaveText(exactText(data.paymentTerms));
  }

  /** Submit the form; lands on the new Purchase Order's details page. */
  async clickCreate(): Promise<void> {
    await this.createButton.click();
    await expect(this.page).toHaveURL(/\/purchase\/order\/\d+\/show/);
  }
}
