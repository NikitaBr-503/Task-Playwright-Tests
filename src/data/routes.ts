/**
 * Application routes, verified against the live app (app.precoro.com).
 *
 * Keeping them in one place means a URL change is a one-line fix rather than a
 * grep across every spec.
 */
export const Routes = {
  // Public
  login: '/login',
  ssoLogin: '/login/company',
  forgotPassword: '/resetting/request',
  magicLink: '/request_link',
  logout: '/logout',

  // Core modules (left navigation rail)
  dashboard: '/',
  purchaseRequisitions: '/purchase/requisition',
  createPurchaseRequisition: '/purchase/requisition/create/manual',
  requestsForProposals: '/rfp',
  purchaseOrders: '/purchase/order',
  receipts: '/receipt',
  invoices: '/invoice',
  expenses: '/expense',
  budgets: '/budget',
  inventory: '/manage/inventory',
  reports: '/reports',
  supplierManagement: '/srm',
  itemManagement: '/manage/item',
  configuration: '/configuration',

  // Account
  profileSettings: '/profile/settings',
  changePassword: '/profile/change-password',
  emailPreferences: '/manage/user_mail/edit',
} as const;

export type Route = (typeof Routes)[keyof typeof Routes];

/**
 * Visible labels of the left navigation rail, mapped to the route each one
 * opens. Used by `SidebarComponent.navigateTo()`.
 */
export const NavItems = {
  Dashboard: Routes.dashboard,
  'Purchase Requisitions': Routes.purchaseRequisitions,
  'Requests for Proposals': Routes.requestsForProposals,
  'Purchase Orders': Routes.purchaseOrders,
  Receipts: Routes.receipts,
  Invoices: Routes.invoices,
  Expenses: Routes.expenses,
  Budgets: Routes.budgets,
  Inventory: Routes.inventory,
  Reports: Routes.reports,
  'Supplier Management': Routes.supplierManagement,
  'Item Management': Routes.itemManagement,
  Configuration: Routes.configuration,
} as const;

export type NavItemLabel = keyof typeof NavItems;
