import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import type { PurchaseRequisitionData } from '@data/purchase-requisition.data';
import { Routes } from '@data/routes';
import { exactText } from '@utils/text';

import { BasePage } from '../base.page';
import { PcSelectComponent } from '../components/pc-select.component';
import { RichTextEditorComponent } from '../components/rich-text-editor.component';

/**
 * Step 1 of the create wizard — `/purchase/requisition/create/manual`.
 *
 * Note that "Next Step" does more than advance a wizard: it persists the
 * document as a Draft and navigates to its details page, where items are added.
 */
export class PurchaseRequisitionCreatePage extends BasePage {
  protected readonly path = Routes.createPurchaseRequisition;

  readonly form = this.page.locator('.create-document-form');
  readonly nextStepButton = this.page.getByRole('button', { name: 'Next Step' });
  readonly note = new RichTextEditorComponent(this.page);

  protected readonly pageLoadedLocator = this.form;

  constructor(page: Page) {
    super(page);
  }

  /** A labelled field wrapper, e.g. `field('Location')`. */
  private field(label: string): Locator {
    return this.page
      .locator('.create-form-element')
      .filter({ has: this.page.locator('.form-label-text', { hasText: label }) });
  }

  get deliveryDateInput(): Locator {
    return this.field('Delivery Date').locator('input.mx-input');
  }

  get locationSelect(): PcSelectComponent {
    return new PcSelectComponent(this.page, this.field('Location').locator('.pc-select').first());
  }

  get departmentSelect(): PcSelectComponent {
    return new PcSelectComponent(
      this.page,
      this.field('Departments').locator('.pc-select').first(),
    );
  }

  async setDeliveryDate(date: string): Promise<void> {
    await this.deliveryDateInput.fill(date);
    // Dismiss the date picker so it cannot overlay the fields below.
    await this.page.keyboard.press('Escape');
    await expect(this.deliveryDateInput).toHaveValue(date);
  }

  /** Fill every field of step 1. Location is preselected but set explicitly. */
  async fillForm(data: PurchaseRequisitionData): Promise<void> {
    await this.setDeliveryDate(data.deliveryDate);

    if ((await this.locationSelect.selectedText()) !== data.location) {
      await this.locationSelect.selectOption(data.location);
    }
    await this.departmentSelect.selectOption(data.department);
    await this.note.setText(data.note);

    await expect(this.locationSelect.value.first()).toHaveText(exactText(data.location));
    await expect(this.departmentSelect.value.first()).toHaveText(exactText(data.department));
  }

  /**
   * Submit step 1. Creates the Draft document and lands on its details page.
   */
  async clickNextStep(): Promise<void> {
    await this.nextStepButton.click();
    await expect(this.page).toHaveURL(/\/purchase\/requisition\/\d+\/show/);
  }
}
