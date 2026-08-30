import { mergeTests } from '@playwright/test';

import { test as apiTest } from './api.fixture';
import { test as pagesTest } from './pages.fixture';

/**
 * The single `test` every spec should import:
 *
 *   import { test, expect } from '@fixtures/index';
 *
 * New fixture files are merged in here, so specs never need to know which file
 * a given fixture came from.
 */
export const test = mergeTests(pagesTest, apiTest);

export { expect } from '@playwright/test';
export type { PageFixtures } from './pages.fixture';
export type { ApiFixtures } from './api.fixture';
