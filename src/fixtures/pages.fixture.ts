import { test as base } from '@playwright/test';

import { CookieConsentBanner } from '@components/cookie-consent.component';
import { HeaderComponent } from '@components/header.component';
import { SidebarComponent } from '@components/sidebar.component';
import { PurchaseRequisitionFlow } from '@flows/purchase-requisition.flow';
import { DashboardPage } from '@pages/dashboard.page';
import { LoginPage } from '@pages/login.page';
import { PurchaseRequisitionCreatePage } from '@pages/purchase-requisitions/purchase-requisition-create.page';
import { PurchaseRequisitionDetailsPage } from '@pages/purchase-requisitions/purchase-requisition-details.page';
import { PurchaseRequisitionListPage } from '@pages/purchase-requisitions/purchase-requisition-list.page';

/**
 * Page Objects and business flows injected into every test.
 *
 * Register new pages here once and they become available by name in any spec:
 *   `test('…', async ({ dashboardPage }) => { … })`
 */
export interface PageFixtures {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  header: HeaderComponent;
  sidebar: SidebarComponent;
  cookieBanner: CookieConsentBanner;

  prListPage: PurchaseRequisitionListPage;
  prCreatePage: PurchaseRequisitionCreatePage;
  prDetailsPage: PurchaseRequisitionDetailsPage;
  /** End-to-end journeys, usable as test preconditions. */
  purchaseRequisitions: PurchaseRequisitionFlow;
}

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  header: async ({ page }, use) => {
    await use(new HeaderComponent(page));
  },
  sidebar: async ({ page }, use) => {
    await use(new SidebarComponent(page));
  },
  cookieBanner: async ({ page }, use) => {
    await use(new CookieConsentBanner(page));
  },

  prListPage: async ({ page }, use) => {
    await use(new PurchaseRequisitionListPage(page));
  },
  prCreatePage: async ({ page }, use) => {
    await use(new PurchaseRequisitionCreatePage(page));
  },
  prDetailsPage: async ({ page }, use) => {
    await use(new PurchaseRequisitionDetailsPage(page));
  },
  purchaseRequisitions: async ({ page }, use) => {
    await use(new PurchaseRequisitionFlow(page));
  },
});
