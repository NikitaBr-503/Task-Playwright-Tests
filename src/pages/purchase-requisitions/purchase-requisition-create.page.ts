import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import type { PurchaseRequisitionData } from '@data/purchase-requisition.data';
import { Routes } from '@data/routes';
import { exactText } from '@utils/text';

import { BasePage } from '../base.page';
import { PcSelectComponent } from '../components/pc-select.component';
import { RichTextEditorComponent } from '../components/rich-text-editor.component';

export class PurchaseRequisitionCreatePage extends BasePage {
  protected readonly path = Routes.createPurchaseRequisition;

  readonly form = this.page.locator('.create-document-form');
  readonly nextStepButton = this.page.getByRole('button', { name: 'Next Step' });
  readonly note = new RichTextEditorComponent(this.page);

  readonly deliveryDateInput = this.field('Delivery Date').locator('input.mx-input');

  readonly locationSelect = new PcSelectComponent(
    this.page,
    this.field('Location').locator('.pc-select').first(),
  );

  readonly departmentSelect = new PcSelectComponent(
    this.page,
    this.field('Departments').locator('.pc-select').first(),
  );

  protected readonly pageLoadedLocator = this.form;

  constructor(page: Page) {
    super(page);
  }

  /**
   * A labelled field wrapper, e.g. `field('Location')`.
   *
   * Safe to call from the field initializers above: prototype methods exist
   * before any instance field runs.
   */
  private field(label: string): Locator {
    return this.page
      .locator('.create-form-element')
      .filter({ has: this.page.locator('.form-label-text', { hasText: label }) });
  }

  async setDeliveryDate(date: string): Promise<void> {
    await this.deliveryDateInput.fill(date);
    await this.page.keyboard.press('Escape');
    await expect(this.deliveryDateInput).toHaveValue(date);
  }

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

  async clickNextStep(): Promise<void> {
    await this.nextStepButton.click();
    await expect(this.page).toHaveURL(/\/purchase\/requisition\/\d+\/show/);
  }
}
