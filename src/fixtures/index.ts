/**
 * The single `test` every spec should import:
 *
 *   import { test, expect } from '@fixtures/index';
 *
 * Should a second fixture file appear, combine them here with Playwright's
 * `mergeTests` so specs never need to know which file a fixture came from.
 */
export { test } from './pages.fixture';

export { expect } from '@playwright/test';
export type { PageFixtures } from './pages.fixture';
