/**
 * Investor-facing API paths (logged-in investor / preview).
 * Base: /api/v1/investors/
 */
export const INVESTOR_API = {
  projectsOpen: "/api/v1/investors/projects/open/",
  projectDetail: (id) => `/api/v1/investors/projects/${id}/`,
  projectContactWyre: (id) => `/api/v1/investors/projects/${id}/contact-wyre/`,
  investmentTickets: "/api/v1/investors/investment-tickets/",
  kpiActiveProjects: "/api/v1/investors/projects/kpi/active-projects/",
  kpiPortfolioCapacity: "/api/v1/investors/projects/kpi/portfolio-capacity/",
  kpiPortfolioGenerationYtd: "/api/v1/investors/projects/kpi/portfolio-generation-ytd/",
  kpiAttention: "/api/v1/investors/projects/kpi/attention/",
  portfolioScore: "/api/v1/investors/portfolio-score/",
  portfolioGeneration: (startMonth, endMonth) => {
    const qs = `startdate=${encodeURIComponent(startMonth)}&enddate=${encodeURIComponent(endMonth)}`;
    return `/api/v1/investors/portfolio-generation/?${qs}`;
  },
  financedProjects: "/api/v1/investors/financed-projects/",
  paymentsTotalCredited: "/api/v1/investors/payments/kpi/total-credited/",
  paymentsDueNext30: "/api/v1/investors/payments/kpi/due-next-30-days/",
  paymentsOverdue90d: "/api/v1/investors/payments/kpi/overdue-90d-plus/",
  paymentsNextPaymentDue: "/api/v1/investors/payments/kpi/next-payment-due/",
  paymentsUpcomingSchedule: "/api/v1/investors/payments/upcoming-schedule/",
  paymentsPayoutHistory: "/api/v1/investors/payments/payout-history/",
  paymentsReceivableHealth: "/api/v1/investors/payments/receivable-health/",
  paymentsLedger: (year) => {
    const base = "/api/v1/investors/payments/ledger/";
    return year != null ? `${base}?year=${encodeURIComponent(year)}` : base;
  },
};
