import { defineConfig, devices } from '@playwright/test';

import { env } from './src/config/env';
import { STORAGE_STATE } from './src/config/paths';

/**
 * Playwright configuration for the Precoro (app.precoro.com) E2E suite.
 *
 * Project graph:
 *   setup ──▶ chromium / firefox / webkit   (UI suites, run authenticated)
 *
 * The `setup` project logs in once and writes storage state to `.auth/`, so
 * every UI project starts already signed in instead of paying for a login per
 * spec. Anything tagged `@no-auth` (login, SSO, logout flows) opts back out by
 * calling `test.use({ storageState: undefined })`.
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  snapshotDir: './tests/__snapshots__',

  /* Fail the build on CI if a `test.only` was committed. */
  forbidOnly: env.isCI,

  fullyParallel: false,
  workers: 1,

  retries: env.runner.retries,

  timeout: env.timeouts.test,
  expect: { timeout: env.timeouts.expect },

  reporter: env.isCI
    ? [
        ['github'],
        ['blob'],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['html', { open: 'never' }],
      ]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: env.baseURL,

    /* Debug artefacts: cheap on green runs, complete on red ones. */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    actionTimeout: env.timeouts.action,
    navigationTimeout: env.timeouts.navigation,

    headless: env.runner.headless,
    launchOptions: { slowMo: env.runner.slowMo },

    testIdAttribute: 'data-testid',
    locale: 'en-US',
    timezoneId: 'Europe/Kyiv',
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'setup',
      testDir: './tests/setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'chromium',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE.user,
      },
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Firefox'],
        storageState: STORAGE_STATE.user,
      },
    },
    {
      name: 'webkit',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Safari'],
        storageState: STORAGE_STATE.user,
      },
    },
  ],
});
