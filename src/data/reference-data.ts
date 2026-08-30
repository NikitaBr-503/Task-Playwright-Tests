/**
 * Reference data — values that must already exist in the Precoro account under
 * test (locations, departments, suppliers, categories…).
 *
 * These are deliberately **not** generated. They are configuration owned by the
 * application, so tests select them by name and assert on them verbatim. Keeping
 * them in one file means re-pointing the suite at a different company is a
 * single edit rather than a hunt through specs.
 *
 * Only values the suite actually selects live here — an unused entry is an
 * unverified claim about the account. Add more as new tests need them.
 *
 * Generated, per-run values (notes, cancellation reasons) live in the data
 * factories instead — see `purchase-requisition.data.ts`.
 */
export const ReferenceData = {
  locations: {
    backoffice: 'Backoffice',
  },
  departments: {
    administration: 'Administration',
  },
  suppliers: {
    apple: 'Apple',
  },
  categories: {
    tech: 'Tech',
  },
  paymentTerms: {
    prepayment: 'Prepayment',
  },
  /**
   * Taxes carry their rate alongside the label so expected totals can be
   * computed rather than hard-coded: `1000 * (1 + 0.1) = 1,100.00`.
   */
  taxes: {
    vat10: { label: 'VAT 10% 10.00%', rate: 0.1 },
  },
  currency: 'EUR',
} as const;

export type TaxDefinition = (typeof ReferenceData.taxes)[keyof typeof ReferenceData.taxes];
