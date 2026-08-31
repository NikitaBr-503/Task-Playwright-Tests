# Precoro E2E Tests

Playwright + TypeScript automation for app precoro,
covering the procure-to-order path: creating a Purchase Requisition, completing
it, cancelling it, and raising a Purchase Order from it.

Every selector and route in this repo was verified against the live application.

## Getting started

```bash
npm install
npm run install:browsers

cp .env.example .env    # then fill in credentials
npm test
```

## Test suites

Four cases, fully specified as manual test cases in
[`tests/ui/README.md`](tests/ui/README.md) — steps, test data, expected results
and a traceability table back to the code.

| ID            | Case                                             | Tag           |
| ------------- | ------------------------------------------------ | ------------- |
| **TC-PR-001** | Create a Purchase Requisition with a single item | `@smoke`      |
| **TC-PR-002** | Mark an approved Purchase Requisition completed  | `@regression` |
| **TC-PR-003** | Cancel a Purchase Requisition with a reason      | `@regression` |
| **TC-PO-001** | Create a Purchase Order from a requisition       | `@smoke`      |

Test titles carry their case ID and every `test.step()` carries its manual step
number, so a failure in the report names the step it broke.

## Environment

All configuration lives in `.env` (git-ignored — never commit it). Copy
`.env.example` as a starting point. Real environment variables always take
precedence over the file, so any runner can override it by exporting them.

| Variable                             | Purpose                          | Default                   |
| ------------------------------------ | -------------------------------- | ------------------------- |
| `BASE_URL`                           | Application under test           | `https://app.precoro.com` |
| `PRECORO_EMAIL` / `PRECORO_PASSWORD` | Credentials for the default user | _required_                |
| `HEADLESS`, `SLOW_MO`                | Local debugging constants        | `true`, `0`               |
| `*_TIMEOUT`, `RETRIES`, `WORKERS`    | Runner tuning                    | see `src/config/env.ts`   |

Values are read through typed helpers in [`src/config/env.ts`](src/config/env.ts)
rather than `process.env` directly — that is what stops `HEADLESS=false` from
being truthy and a missing credential from surfacing as a mystery login failure.

## Scripts

| Command                   | What it does                                           |
| ------------------------- | ------------------------------------------------------ |
| `npm test`                | Full suite (setup + all three browsers)                |
| `npm run test:headed`     | Watch it run in a real browser                         |
| `npm run test:ui`         | Playwright UI mode (best for authoring specs)          |
| `npm run test:debug`      | Step through with the inspector                        |
| `npm run test:chromium`   | Single browser (also `:firefox`, `:webkit`)            |
| `npm run test:smoke`      | Only `@smoke`-tagged tests                             |
| `npm run test:regression` | Only `@regression`-tagged tests                        |
| `npm run test:name`       | Run tests whose **title** matches an argument          |
| `npm run test:file`       | Run a **file, directory or line** given as an argument |
| `npm run test:auth`       | Re-run the login setup / refresh stored session        |
| `npm run report`          | Open the last HTML report                              |
| `npm run trace`           | Open a saved trace file                                |
| `npm run codegen`         | Record selectors against the live app                  |
| `npm run typecheck`       | `tsc --noEmit`                                         |
| `npm run format`          | Prettier (`format:check` to verify only)               |
| `npm run clean`           | Remove reports, results and cached sessions            |

### Running a single test

Arguments go after `--`, which is how npm forwards them to Playwright.

```bash
# by case ID — test titles are prefixed TC-PR-001 … TC-PO-001
npm run test:name -- "TC-PR-002"

# by any words from the title
npm run test:name -- "canceled with a reason"

# by file, directory, or file:line
npm run test:file -- tests/ui/purchase-orders
npm run test:file -- create-purchase-order.spec.ts:35

# extra flags pass through as usual
npm run test:name -- "TC-PO-001" --headed --project=chromium
```

`test:name` is `--grep`, so the argument is a **regular expression matched
against the full title** — `TC-PR-00` selects all three requisition cases, and a
literal `(` or `.` needs escaping.

## Architecture

Five layers, each with one job. A spec only ever talks to the top two.

```
spec  ─▶  actions   multi-page journeys, usable as preconditions
      ─▶  pages     one class per screen: locators + intent methods
          └ components   reusable widgets (select, dialog, toast, …)
      ─▶  data      routes, reference values, faker-backed factories
      ─▶  config    typed env, storage-state paths
```

```
.
├── playwright.config.ts        # projects, reporters, timeouts, artifacts
├── tsconfig.json               # strict TS + @-path aliases
├── .env / .env.example         # secrets (ignored) + template (committed)
│
├── src/                        # framework code — no tests live here
│   ├── config/
│   │   ├── env.ts              # typed, validated environment access
│   │   └── paths.ts            # storage-state paths
│   ├── pages/                  # Page Objects
│   │   ├── base.page.ts        # navigation + readiness contract
│   │   ├── base.component.ts   # root-scoped component contract
│   │   ├── login.page.ts
│   │   ├── dashboard.page.ts
│   │   ├── purchase-requisitions/   list · create · details
│   │   ├── purchase-orders/         list · create · details
│   │   └── components/         # widgets reused across pages
│   │       ├── pc-select.component.ts         # the app's custom dropdown
│   │       ├── confirm-dialog.component.ts    # Yes/No, with optional reason
│   │       ├── more-actions-menu.component.ts # the "…" header menu
│   │       ├── rich-text-editor.component.ts  # tiptap note editor
│   │       ├── toast.component.ts             # transient notifications
│   │       ├── sidebar.component.ts
│   │       └── cookie-consent.component.ts
│   ├── actions/                # journeys that span pages
│   │   ├── purchase-requisition.actions.ts    # create()
│   │   └── purchase-order.actions.ts          # createFromRequisition()
│   ├── fixtures/               # dependency injection for specs
│   │   ├── pages.fixture.ts    # the registry
│   │   └── index.ts            # the only import specs need
│   ├── data/
│   │   ├── routes.ts           # verified URL map
│   │   ├── reference-data.ts   # values that must exist in the account
│   │   ├── purchase-requisition.data.ts
│   │   └── purchase-order.data.ts
│   └── utils/
│       ├── date.ts             # dd.MM.yyyy formatting
│       ├── currency.ts         # 1,000.00 formatting
│       └── text.ts             # anchored matchers for hasText
│
├── tests/
│   ├── setup/auth.setup.ts     # logs in once, saves .auth/user.json
│   └── ui/                     # specs + the manual test-case docs
│       ├── purchase-requisitions/
│       └── purchase-orders/
│
├── .auth/                      # stored sessions (ignored)
├── test-results/               # traces, screenshots, videos (ignored)
└── playwright-report/          # HTML report (ignored)
```

## How it fits together

**Authentication runs once.** The `setup` project signs in through `LoginPage`
and writes the session to `.auth/user.json`. Every browser project declares
`dependencies: ['setup']` and loads that state, so a hundred specs still cost
one login. That matters here: Precoro locks an account for 30 minutes after 6
failed attempts.

A spec that needs to start signed out opts back out:

```ts
test.use({ storageState: { cookies: [], origins: [] } });
```

**Specs import one thing.** `@fixtures/index` is the only import a spec needs for
`test` and `expect`. Page objects arrive as named arguments, so specs never
construct them and the signature doubles as the test's dependency list:

```ts
import { test, expect } from '@fixtures/index';

test('TC-PR-002 — …', async ({ prListPage, prDetailsPage }) => {
  await prListPage.open();
  await expect(prListPage.rowStatus('42')).toHaveText('Completed');
});
```

Available fixtures: `prListPage`, `prDetailsPage`, `poListPage`, `poDetailsPage`,
`purchaseRequisitions`, `purchaseOrders`. Only pages a spec reaches for directly
are registered — the create forms are driven from inside the action classes.

**Setup is an action, not a test step.** Creating a document is a journey every
suite needs, so it lives in `src/actions/` and is one line in a precondition:

```ts
test.beforeEach(async ({ purchaseRequisitions }) => {
  created = await purchaseRequisitions.create(buildPurchaseRequisition());
});
```

The action asserts internally, so a half-broken precondition fails immediately
instead of leaving the test to report a confusing downstream error.

**Page objects own selectors, specs own assertions.** `BasePage` supplies
`open()` / `waitUntilLoaded()`; each page declares its `path` and the locator
that proves it rendered. Components (`BaseComponent`) scope all queries to a
`root` locator so the same class works anywhere the widget appears. Within a
class, locators come first, then the constructor, then methods.

**Test data splits two ways.** Reference values — Backoffice, Administration,
Apple, Tech — are account configuration, so they live in `reference-data.ts` and
are asserted verbatim. Free text is generated per run with faker and tagged
`[e2e …]`, so runs never collide and suite-created documents stay identifiable.
Factories take overrides, so a new case varies one field without redefining the
payload:

```ts
buildPurchaseRequisition({ items: [buildPurchaseRequisitionItem({ quantity: 5 })] });
```

## Test data hygiene

The suite is UI-only and there is no UI path to delete a confirmed document, so
**every run leaves data behind** — a requisition per test, plus a Purchase Order
and a real email to the supplier for `TC-PO-001`. Generated notes are prefixed
`[e2e ]` to make suite-created records identifiable.

## Future improvements

Ordered by what would pay off soonest for this suite specifically.

### 1. Test data cleanup (highest value)

### 2. CI integration

### 3. Allure reporting

### 4. Paralellization across CI machines

### 5. Cross-browser verification

### 6. Tooling:

- **ESLint** with `eslint-plugin-playwright`, to catch missing `await` on
  assertions and forbid `page.waitForTimeout` before it reaches review.
- **Visual regression** via `toHaveScreenshot()` on stable pages, and
  **accessibility** checks with `@axe-core/playwright`.

### 7. AI Agents with advanced Playwright skills and connected MCP.
