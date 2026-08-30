import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { exactText } from '@utils/text';

import { BaseComponent } from '../base.component';

/**
 * Custom `.pc-select` dropdown.
 */
export class PcSelectComponent extends BaseComponent {
  readonly control = this.root.locator('.pc-select__control');
  readonly value = this.root.locator('.pc-select__value');
  readonly searchInput = this.root.locator('input.pc-select__value_input');

  constructor(page: Page, root: Locator | string) {
    super(page, root);
  }

  /**
   * The dropdown panel that is currently open, wherever it was portalled to.
   *
   * A locator is a lazy description, so this re-resolves on every use — it
   * always refers to whichever menu is open *now*, not at construction time.
   */
  private readonly openMenu = this.page
    .locator('.pc-select__menu')
    .filter({ visible: true })
    .last();

  async isOpen(): Promise<boolean> {
    return this.openMenu.isVisible().catch(() => false);
  }

  async open(): Promise<void> {
    if (await this.isOpen()) return;
    await this.control.first().click();
    await expect(this.openMenu).toBeVisible();
  }

  /**
   * Pick an option by its exact visible label.
   *
   * Long lists (suppliers, categories) are virtualised, so when the dropdown
   * offers a search box we type into it first to bring the option into view.
   */
  async selectOption(label: string): Promise<void> {
    await this.open();

    if (await this.searchInput.isEditable().catch(() => false)) {
      await this.searchInput.fill(label);
    }

    const option = this.openMenu
      .locator('.pc-select__option')
      .filter({ hasText: exactText(label) })
      .first();

    await expect(option).toBeVisible();
    await option.click();
    await expect(this.openMenu).toBeHidden();
  }

  /**
   * Tick an option in a checkbox-style multi-select.
   */
  async checkOption(label: string): Promise<void> {
    await this.open();
    const checkbox = this.page.getByRole('checkbox', { name: label });
    await expect(checkbox.first()).toBeVisible();
    await checkbox.first().check();
  }

  /** Close an open menu without changing the selection. */
  async close(): Promise<void> {
    if (!(await this.isOpen())) return;
    await this.page.keyboard.press('Escape');
    await expect(this.openMenu).toBeHidden();
  }

  /** Currently selected label, or `''` when nothing is chosen. */
  async selectedText(): Promise<string> {
    return (await this.value.first().innerText()).trim();
  }
}
