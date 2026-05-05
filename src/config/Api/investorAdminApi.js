/**
 * Wyre investor administration API segments.
 * Base: /api/v1/investors/admin/
 * Each key is a resource; list/detail use trailing slash + id + "/".
 */
export const INVESTOR_ADMIN_API = {
  investorUsers: "/api/v1/investors/admin/investor-users/",
  projects: "/api/v1/investors/admin/projects/",
  investments: "/api/v1/investors/admin/investments/",
  customerPayments: "/api/v1/investors/admin/customer-payments/",
  investorPayouts: "/api/v1/investors/admin/investor-payouts/",
  /** Query: ?investment_id=… */
  investorPaymentSchedules: "/api/v1/investors/admin/investor-payment-schedules/",
};
