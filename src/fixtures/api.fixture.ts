import { test as base } from '@playwright/test';

import { ApiClient } from '@api/api-client';

export interface ApiFixtures {
  api: ApiClient;
}

/**
 * Authenticated API client, backed by the same storage state the UI projects
 * use — handy for seeding data or asserting state without going through the UI.
 */
export const test = base.extend<ApiFixtures>({
  api: async ({ request }, use) => {
    await use(new ApiClient(request));
  },
});
