import { faker } from '@faker-js/faker';

import { today } from '@utils/date';

import { ReferenceData } from './reference-data';

export interface PurchaseRequisitionItemData {
  name: string;
  quantity: number;
  price: number;
  supplier: string;
  category: string;
}

export interface PurchaseRequisitionData {
  /** `dd.MM.yyyy` — the format the delivery-date input expects. */
  deliveryDate: string;
  location: string;
  department: string;
  note: string;
  items: PurchaseRequisitionItemData[];
}

/**
 * Test-data factories.
 *
 * The split is deliberate:
 *
 * - **Reference values** (location, department, supplier, category) are fixed,
 *   because they must exist in the account and the assertions compare against
 *   them literally.
 * - **Free-text values** (the note) are generated per run with faker, so two
 *   runs never collide and a created document can be traced back to the run
 *   that made it.
 *
 * Every field is overridable, so a future negative or edge-case test can vary
 * exactly one thing without redefining the whole payload:
 *
 * ```ts
 * buildPurchaseRequisition({ items: [buildItem({ quantity: 0 })] });
 * ```
 */
export function buildPurchaseRequisitionItem(
  overrides: Partial<PurchaseRequisitionItemData> = {},
): PurchaseRequisitionItemData {
  return {
    name: 'Notepad',
    quantity: 1,
    price: 1000,
    supplier: ReferenceData.suppliers.apple,
    category: ReferenceData.categories.tech,
    ...overrides,
  };
}

export function buildPurchaseRequisition(
  overrides: Partial<PurchaseRequisitionData> = {},
): PurchaseRequisitionData {
  return {
    deliveryDate: today(),
    location: ReferenceData.locations.backoffice,
    department: ReferenceData.departments.administration,
    note: generateNote(),
    items: [buildPurchaseRequisitionItem()],
    ...overrides,
  };
}

/**
 * A unique, traceable note. The `[e2e ...]` tag makes documents created by the
 * suite easy to spot — and to filter out — in the real application.
 */
export function generateNote(): string {
  return `[e2e ${faker.string.alphanumeric(6)}] ${faker.commerce.productDescription()}`;
}

/** Expected line total for an item, as the UI computes it. */
export function itemTotal(item: PurchaseRequisitionItemData): number {
  return item.quantity * item.price;
}

/** Expected document total across all items. */
export function documentTotal(data: PurchaseRequisitionData): number {
  return data.items.reduce((sum, item) => sum + itemTotal(item), 0);
}
