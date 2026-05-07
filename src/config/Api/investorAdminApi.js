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
  customerPaymentSchedules: "/api/v1/investors/admin/customer-payment-schedules/",
  investorPayouts: "/api/v1/investors/admin/investor-payouts/",
  /** Query: ?investment_id=… */
  investorPaymentSchedules: "/api/v1/investors/admin/investor-payment-schedules/",
  directory: {
    investors: "/api/v1/investors/admin/directory/investors/",
    financeByInvestor: "/api/v1/investors/admin/directory/finance-by-investor/",
    investments: "/api/v1/investors/admin/directory/investments/",
  },
  supportTickets: "/api/v1/investors/admin/support-tickets/",
  overview: {
    totalInvested: "/api/v1/investors/admin/overview/total-invested/",
    customersExpected: "/api/v1/investors/admin/overview/customers-expected/",
    activeProjects: "/api/v1/investors/admin/overview/active-projects/",
    activeInvestors: "/api/v1/investors/admin/overview/active-investors/",
    nearestPayments: "/api/v1/investors/admin/overview/nearest-payments/",
  },
};
