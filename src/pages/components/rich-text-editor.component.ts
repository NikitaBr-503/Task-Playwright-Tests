import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { BaseComponent } from '../base.component';

/**
 * The tiptap rich-text editor used for document notes.
 */
export class RichTextEditorComponent extends BaseComponent {
  readonly editable = this.root.locator('.ProseMirror, [contenteditable="true"]').first();

  constructor(page: Page, root: Locator | string = '.tiptap-editor') {
    super(page, root);
  }

  async setText(text: string): Promise<void> {
    await this.editable.click();
    await this.editable.press('ControlOrMeta+a');
    await this.editable.press('Backspace');
    await this.editable.pressSequentially(text);
    await expect(this.editable).toContainText(text);
  }
}
