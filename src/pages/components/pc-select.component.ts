import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { exactText } from '@utils/text';

import { BaseComponent } from '../base.component';

/**
 * Precoro's custom `.pc-select` dropdown.
 *
 * Two behaviours make this worth wrapping:
 *
 * 1. **Options are portalled.** They render into a `.pc-select__menu` outside
 *    the select's own subtree, so scoping option lookups to the component root
 *    finds nothing. We target the currently-open menu instead.
 * 2. **Menus of closed selects can linger in the DOM.** A page-wide
 *    `.pc-select__option` lookup can therefore match an option belonging to a
 *    different dropdown — on the item row, the unit select's options sit
 *    alongside the category select's. Filtering to the *visible* menu avoids
 *    picking the wrong list.
 */
export class PcSelectComponent extends BaseComponent {
  readonly control = this.root.locator('.pc-select__control');
  readonly value = this.root.locator('.pc-select__value');
  readonly searchInput = this.root.locator('input.pc-select__value_input');

  constructor(page: Page, root: Locator | string) {
    super(page, root);
  }

  /** The dropdown panel that is currently open, wherever it was portalled to. */
  private get openMenu(): Locator {
    return this.page.locator('.pc-select__menu').filter({ visible: true }).last();
  }

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

  /** Currently selected label, or `''` when nothing is chosen. */
  async selectedText(): Promise<string> {
    return (await this.value.first().innerText()).trim();
  }

  async expectSelected(label: string): Promise<void> {
    await expect(this.value.first()).toHaveText(exactText(label));
  }
}
