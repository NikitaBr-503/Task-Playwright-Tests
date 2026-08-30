# UI specs

One folder per application module, mirroring the left navigation rail:

```
tests/ui/
├── auth/            # login, logout, SSO, password reset      (@no-auth)
├── dashboard/       # landing page, widgets, action cards
├── purchase-requisitions/
├── purchase-orders/
├── invoices/
├── suppliers/
└── configuration/
```

## Conventions

Import the shared `test`, never `@playwright/test` directly — that is what wires
up the Page Object fixtures:

```ts
import { test, expect } from '@fixtures/index';

test('dashboard shows the analytics widgets @smoke', async ({ dashboardPage }) => {
  await dashboardPage.open();
  expect(await dashboardPage.widgetTitles()).not.toHaveLength(0);
});
```

- Specs here run **already authenticated** (see `tests/setup/auth.setup.ts`).
- A spec that must start signed out opts out explicitly:

  ```ts
  test.use({ storageState: { cookies: [], origins: [] } });
  ```

- Tag tests with `@smoke` / `@regression` to select them via
  `npm run test:smoke` and `npm run test:regression`.
