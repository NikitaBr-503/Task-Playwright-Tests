import { generateNote } from './purchase-requisition.data';
import { ReferenceData, type TaxDefinition } from './reference-data';

export interface PurchaseOrderData {
  paymentTerms: string;
  /** Taxes to tick in the multi-select, with their rates for total maths. */
  taxes: TaxDefinition[];
  note: string;
}

/**
 * Purchase Order factory — same split as the requisition factory: reference
 * values fixed, free text generated per run.
 */
export function buildPurchaseOrder(overrides: Partial<PurchaseOrderData> = {}): PurchaseOrderData {
  return {
    paymentTerms: ReferenceData.paymentTerms.prepayment,
    taxes: [ReferenceData.taxes.vat10],
    note: generateNote(),
    ...overrides,
  };
}

/** Tax amount for a given net total. */
export function taxAmount(netTotal: number, data: PurchaseOrderData): number {
  const rate = data.taxes.reduce((sum, tax) => sum + tax.rate, 0);
  return netTotal * rate;
}

/** Gross total = net + tax. */
export function grossTotal(netTotal: number, data: PurchaseOrderData): number {
  return netTotal + taxAmount(netTotal, data);
}
