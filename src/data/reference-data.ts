/**
 * Reference data — values that must already exist in the Precoro account under
 * test (locations, departments, suppliers, categories…).
 *
 * These are deliberately **not** generated. They are configuration owned by the
 * application, so tests select them by name and assert on them verbatim. Keeping
 * them in one file means re-pointing the suite at a different company is a
 * single edit rather than a hunt through specs.
 *
 * Generated, per-run values (notes, descriptions) live in the data factories
 * instead — see `purchase-requisition.data.ts`.
 */
export const ReferenceData = {
  locations: {
    backoffice: 'Backoffice',
    headquarters: 'Headquarters',
  },
  departments: {
    administration: 'Administration',
    finance: 'Finance',
    management: 'Management',
    humanResources: 'Human Resources',
    marketing: 'Marketing',
    sales: 'Sales',
  },
  suppliers: {
    apple: 'Apple',
    amazon: 'Amazon',
    staples: 'Staples',
    zoom: 'Zoom',
  },
  categories: {
    tech: 'Tech',
    officeSupplies: 'Office Supplies',
    services: 'Services',
    travel: 'Travel',
    marketing: 'Marketing',
  },
  units: {
    piece: 'piece',
    pack: 'pack',
    kilogram: 'kilogram',
    pound: 'pound',
  },
  currency: 'EUR',
} as const;
