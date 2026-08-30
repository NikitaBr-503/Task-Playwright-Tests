/**
 * Application routes, verified against the live app (app.precoro.com).
 *
 * Every page object takes its `path` from here, so a URL change is a one-line
 * fix rather than a grep across the suite. Routes are added as the modules they
 * belong to gain page objects — an unreferenced route is just an unverified
 * claim about the app.
 */
export const Routes = {
  // Public
  login: '/login',

  // Modules
  dashboard: '/',
  purchaseRequisitions: '/purchase/requisition',
  createPurchaseRequisition: '/purchase/requisition/create/manual',
  purchaseOrders: '/purchase/order',
  createPurchaseOrder: '/purchase/order/create/from_requests',
} as const;

export type Route = (typeof Routes)[keyof typeof Routes];

/**
 * Visible labels of the left navigation rail, mapped to the route each one
 * opens. Used by `SidebarComponent.navigateTo()`, which asserts the resulting
 * URL — so a label only belongs here once its route is known-good.
 */
export const NavItems = {
  Dashboard: Routes.dashboard,
  'Purchase Requisitions': Routes.purchaseRequisitions,
  'Purchase Orders': Routes.purchaseOrders,
} as const;

export type NavItemLabel = keyof typeof NavItems;
