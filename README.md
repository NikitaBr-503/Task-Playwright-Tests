# Precoro E2E Tests

Playwright + TypeScript automation framework for [app.precoro.com](https://app.precoro.com/).

The scaffolding is complete and verified against the live application — page
objects, fixtures and authentication are wired up and running. No feature specs
are written yet; `tests/ui/` and `tests/api/` are ready for them.

## Getting started

```bash
npm install
npm run install:browsers

cp .env.example .env    # then fill in credentials
npm test
```

## Environment

All configuration lives in `.env` (git-ignored — never commit it). Copy
`.env.example` as a starting point. Real environment variables always take
precedence over the file, so any runner can override it by exporting them.

| Variable                                  | Purpose                          | Default                   |
| ----------------------------------------- | -------------------------------- | ------------------------- |
| `BASE_URL`                                | Application under test           | `https://app.precoro.com` |
| `PRECORO_EMAIL` / `PRECORO_PASSWORD`      | Credentials for the default user | _required_                |
| `PRECORO_APPROVER_EMAIL` / `..._PASSWORD` | Optional second role             | —                         |
| `HEADLESS`, `SLOW_MO`                     | Local debugging knobs            | `true`, `0`               |
| `*_TIMEOUT`, `RETRIES`, `WORKERS`         | Runner tuning                    | see `src/config/env.ts`   |

## Scripts

| Command                   | What it does                                    |
| ------------------------- | ----------------------------------------------- |
| `npm test`                | Full suite, all projects                        |
| `npm run test:headed`     | Watch it run in a real browser                  |
| `npm run test:ui`         | Playwright UI mode (best for authoring specs)   |
| `npm run test:debug`      | Step through with the inspector                 |
| `npm run test:chromium`   | Single browser (also `:firefox`, `:webkit`)     |
| `npm run test:smoke`      | Only `@smoke`-tagged tests                      |
| `npm run test:regression` | Only `@regression`-tagged tests                 |
| `npm run test:api`        | API project only                                |
| `npm run test:auth`       | Re-run the login setup / refresh stored session |
| `npm run report`          | Open the last HTML report                       |
| `npm run codegen`         | Record selectors against the live app           |
| `npm run typecheck`       | `tsc --noEmit`                                  |
| `npm run format`          | Prettier                                        |
| `npm run clean`           | Remove reports, results and cached sessions     |

## Folder structure

```
.
├── playwright.config.ts        # projects, reporters, timeouts, artifacts
├── tsconfig.json               # strict TS + @-path aliases
├── .env / .env.example         # secrets (ignored) + template (committed)
│
├── src/                        # framework code — no tests live here
│   ├── config/
│   │   ├── env.ts              # typed, validated environment access
│   │   └── paths.ts            # storage-state and root paths
│   ├── pages/                  # Page Objects
│   │   ├── base.page.ts        # navigation + readiness contract
│   │   ├── base.component.ts   # root-scoped component contract
│   │   ├── login.page.ts
│   │   ├── dashboard.page.ts
│   │   ├── index.ts
│   │   └── components/         # widgets reused across pages
│   │       ├── header.component.ts
│   │       ├── sidebar.component.ts
│   │       └── cookie-consent.component.ts
│   ├── fixtures/               # dependency injection for specs
│   │   ├── pages.fixture.ts
│   │   ├── api.fixture.ts
│   │   └── index.ts            # mergeTests — the only import specs need
│   ├── api/
│   │   ├── api-client.ts       # typed wrapper over APIRequestContext
│   │   └── endpoints/          # one module per resource
│   ├── data/
│   │   ├── users.ts            # roles, lazily resolved from env
│   │   └── routes.ts           # verified URL map
│   └── utils/
│       ├── logger.ts
│       └── data-factory.ts     # unique, traceable test data
│
├── tests/                      # specs only
│   ├── setup/auth.setup.ts     # logs in once, saves .auth/user.json
│   ├── ui/                     # one folder per module (see its README)
│   └── api/
│
├── .auth/                      # stored sessions (ignored)
├── test-results/               # traces, screenshots, videos (ignored)
└── playwright-report/          # HTML report (ignored)
```

## How it fits together

**Authentication runs once.** The `setup` project signs in through `LoginPage`
and writes the session to `.auth/user.json`. Every browser project declares
`dependencies: ['setup']` and loads that state, so a hundred specs still cost
one login. This matters here: Precoro locks an account for 30 minutes after 6
failed attempts.

A spec that needs to start signed out opts back out:

```ts
test.use({ storageState: { cookies: [], origins: [] } });
```

**Specs import one thing.** `@fixtures/index` merges every fixture file, so page
objects arrive as named arguments and specs never construct them:

```ts
import { test, expect } from '@fixtures/index';

test('opens purchase requisitions @smoke', async ({ dashboardPage }) => {
  await dashboardPage.open();
  await dashboardPage.sidebar.navigateTo('Purchase Requisitions');
});
```

**Page objects own selectors, specs own assertions.** `BasePage` supplies
`open()` / `waitUntilLoaded()`; each page declares its `path` and the locator
that proves it rendered. Components (`BaseComponent`) scope all queries to a
`root` locator so the same class works anywhere the widget appears.

**Adding a page** — create `src/pages/<name>.page.ts` extending `BasePage`, add
its route to `src/data/routes.ts`, and register it in
`src/fixtures/pages.fixture.ts`. It is then injectable everywhere.

## Notes on the application

Precoro ships **no `data-testid` attributes**, so locators here anchor on stable
form ids (`#login_form`, `#username`, `#password`), the SPA root (`#DashboardApp`),
and semantic roles. `testIdAttribute` is still configured for the day they land.

A Termly cookie banner renders over the login form and can swallow clicks —
`CookieConsentBanner.dismiss()` handles it, and `LoginPage.open()` calls it
automatically.
