import { APIService } from "../../../config/Api/apiServices";
import { INVESTOR_API } from "../../../config/Api/investorApi";
import {
  investorAccountKycLoading,
  investorAccountKycSuccess,
  investorPaymentsLoading,
  investorPaymentsSuccess,
  investorPortfolioOverviewFail,
  investorPortfolioOverviewLoading,
  investorPortfolioOverviewSuccess,
  investorProjectsLoading,
  investorProjectsSuccess,
  investorTotalDepositedSuccess,
  investorSupportTicketsLoading,
  investorSupportTicketsSuccess,
  investorSupportTicketsFail,
  investorSupportTicketDetailLoading,
  investorSupportTicketDetailSuccess,
  investorSupportTicketDetailClear,
  investorSupportTicketCreateLoading,
} from "./investor.creator";
import {
  mapCo2Card,
  mapFinancedProjectsTable,
  mapNotificationsToAlert,
  mapPerformanceSnapshotChart,
  mapPortfolioGenerationCard,
  mapPrimaryReceivablesCard,
  mapRecentPaymentActivity,
  mapPortfolioScoreCard,
  mapRepaymentTotalsCard,
  mapTotalDepositedCard,
} from "../../../helpers/investorPortfolioMappers";
import {
  mapFinancedProjectsTiles,
  mapInvestmentTicketsList,
  mapInvestorSupportTicketDetail,
  mapInvestorSupportTicketsList,
  mapOpenProjectsList,
  mapProjectsPageSummary,
} from "../../../helpers/investorProjectsMappers";
import { buildPaymentsPagePayload, mapProjectPayoutSchedule } from "../../../helpers/investorPaymentsMappers";
import { MOCK_INVESTOR_ACCOUNT_KYC } from "../../reducers/investor/investor.initialData";

const readErrorMessage = (error) => {
  const data = error.response?.data;
  if (!data) return error.message || "Request failed";
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail.map((d) => d.msg || d).join("; ");
  }
  if (data.message) {
    return typeof data.message === "string" ? data.message : JSON.stringify(data.message);
  }
  return error.message || "Request failed";
};

/**
 * Portfolio landing: parallel GETs (month range as YYYY-MM).
 */
export const fetchInvestorPortfolioOverview =
  (startMonth, endMonth) => async (dispatch) => {
    dispatch(investorPortfolioOverviewLoading(true));
    const genQs = `startdate=${encodeURIComponent(startMonth)}&enddate=${encodeURIComponent(endMonth)}`;
    const perfQs = `start=${encodeURIComponent(startMonth)}&end=${encodeURIComponent(endMonth)}`;

    const requests = [
      ["notifications", "/api/v1/investors/notifications/"],
      ["totalReceivables", INVESTOR_API.totalReceivables],
      ["portfolioScore", INVESTOR_API.portfolioScore],
      ["portfolioGeneration", INVESTOR_API.portfolioGeneration(startMonth, endMonth)],
      ["repaymentTotals", "/api/v1/investors/repayment-totals/"],
      ["co2", `/api/v1/investors/co2-offset/?${genQs}`],
      ["financedProjects", INVESTOR_API.financedProjects],
      ["performanceSnapshot", `/api/v1/investors/performance-snapshot/?${perfQs}`],
      ["recentPaymentActivity", "/api/v1/investors/recent-payment-activity/"],
    ];

    const results = await Promise.allSettled(
      requests.map(([, url]) => APIService.get(url).then((res) => res.data))
    );

    const raw = {};
    const errors = [];
    results.forEach((r, i) => {
      if (r.status === "fulfilled") raw[requests[i][0]] = r.value;
      else errors.push(requests[i][0]);
    });

    if (errors.length === requests.length) {
      const firstRej = results.find((r) => r.status === "rejected");
      const msg =
        firstRej?.reason?.response?.data?.detail ||
        firstRej?.reason?.message ||
        "Unable to load portfolio";
      dispatch(investorPortfolioOverviewFail(msg));
      dispatch(investorPortfolioOverviewLoading(false));
      return { fulfilled: false, message: msg };
    }

    const financedProjects = mapFinancedProjectsTable(raw.financedProjects);

    const payload = {
      partialErrors: errors.length ? errors : null,
      alert: mapNotificationsToAlert(raw.notifications),
      kpis: {
        primaryReceivables: mapPrimaryReceivablesCard(
          raw.totalReceivables,
          raw.repaymentTotals
        ),
        portfolioScore: mapPortfolioScoreCard(raw.portfolioScore),
        portfolioGeneration: mapPortfolioGenerationCard(raw.portfolioGeneration),
        repaymentTotals: mapRepaymentTotalsCard(raw.repaymentTotals),
        co2: mapCo2Card(raw.co2),
      },
      financedProjects,
      chartData: mapPerformanceSnapshotChart(raw.performanceSnapshot),
      activity: mapRecentPaymentActivity(raw.recentPaymentActivity),
    };

    dispatch(investorPortfolioOverviewSuccess(payload));
    dispatch(investorPortfolioOverviewLoading(false));
    return { fulfilled: true, partial: errors.length > 0 };
  };

/** Wallet-investor only — loaded separately so it does not affect other portfolio KPIs. */
export const fetchInvestorTotalDeposited = () => async (dispatch) => {
  try {
    const res = await APIService.get(INVESTOR_API.totalDeposited);
    dispatch(investorTotalDepositedSuccess(mapTotalDepositedCard(res.data)));
  } catch {
    dispatch(investorTotalDepositedSuccess(null));
  }
};

/** Projects page: KPIs, open projects, financed sites, investment tickets. */
export const fetchInvestorProjects = () => async (dispatch) => {
  dispatch(investorProjectsLoading(true));

  const requests = [
    ["openProjects", INVESTOR_API.projectsOpen],
    ["investmentTickets", INVESTOR_API.investmentTickets],
    ["activeProjects", INVESTOR_API.kpiActiveProjects],
    ["portfolioCapacity", INVESTOR_API.kpiPortfolioCapacity],
    ["portfolioGenerationYtd", INVESTOR_API.kpiPortfolioGenerationYtd],
    ["attention", INVESTOR_API.kpiAttention],
    ["projectsFinanced", INVESTOR_API.projectsFinanced],
  ];

  const results = await Promise.allSettled(
    requests.map(([, url]) => APIService.get(url).then((res) => res.data))
  );

  const raw = {};
  const errors = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") raw[requests[i][0]] = r.value;
    else errors.push(requests[i][0]);
  });

  if (errors.length === requests.length) {
    const firstRej = results.find((r) => r.status === "rejected");
    const msg = readErrorMessage(firstRej?.reason || new Error("Unable to load projects"));
    dispatch(investorProjectsLoading(false));
    return { fulfilled: false, message: msg };
  }

  const financedTiles = mapFinancedProjectsTiles(raw.projectsFinanced);
  const payload = {
    partialErrors: errors.length ? errors : null,
    summary: mapProjectsPageSummary({
      activeProjectsRaw: raw.activeProjects,
      portfolioCapacityRaw: raw.portfolioCapacity,
      portfolioGenerationYtdRaw: raw.portfolioGenerationYtd,
      attentionRaw: raw.attention,
    }),
    projects: financedTiles,
    openProjects: mapOpenProjectsList(raw.openProjects),
    investmentTickets: mapInvestmentTicketsList(raw.investmentTickets),
  };

  dispatch(investorProjectsSuccess(payload));
  dispatch(investorProjectsLoading(false));
  return { fulfilled: true, partial: errors.length > 0 };
};

/** GET investors/projects/:id/ (cost breakdown, full detail). */
export const fetchInvestorProjectDetail = (projectId) => async () => {
  try {
    const response = await APIService.get(INVESTOR_API.projectDetail(projectId));
    const body = response.data;
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Failed to load project" };
    }
    return { fulfilled: true, data: body.data };
  } catch (error) {
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

/** POST investors/projects/:id/contact-wyre/ */
export const submitInvestorProjectContactWyre =
  (projectId, payload) => async (dispatch) => {
    try {
      const response = await APIService.post(
        INVESTOR_API.projectContactWyre(projectId),
        payload
      );
      const body = response.data;
      if (body.status === false) {
        return { fulfilled: false, message: body.message || "Could not submit interest" };
      }
      await dispatch(fetchInvestorProjects());
      return {
        fulfilled: true,
        data: body.data,
        message: body.data?.message || body.message || "Wyre has received your investment interest.",
      };
    } catch (error) {
      return { fulfilled: false, message: readErrorMessage(error) };
    }
  };

/**
 * Payments page: KPIs, schedule, payout history, receivable health, ledger.
 * @param {{ start?: string, end?: string, ledgerYear?: number }} [options]
 */
const isInvestorApiFailure = (body) => {
  if (body == null) return true;
  if (body.status === false) return true;
  return false;
};

export const fetchInvestorPayments =
  (options = {}) =>
  async (dispatch) => {
    dispatch(investorPaymentsLoading(true));

    const { start, end, ledgerYear = new Date().getFullYear() } = options;

    const requests = [
      ["totalCredited", INVESTOR_API.paymentsTotalCredited],
      ["dueNext30", INVESTOR_API.paymentsDueNext30],
      ["overdue90", INVESTOR_API.paymentsOverdue90d],
      ["nextPaymentDue", INVESTOR_API.paymentsNextPaymentDue],
      ["upcomingSchedule", INVESTOR_API.paymentsUpcomingSchedule],
      ["payoutHistory", INVESTOR_API.paymentsPayoutHistory],
      ["receivableHealth", INVESTOR_API.paymentsReceivableHealth],
      ["ledger", INVESTOR_API.paymentsLedger(ledgerYear)],
    ];

    const results = await Promise.allSettled(
      requests.map(([, url]) => APIService.get(url).then((res) => res.data))
    );

    const apiResponses = {};
    const partialErrors = [];
    results.forEach((r, i) => {
      const key = requests[i][0];
      if (r.status !== "fulfilled") {
        partialErrors.push(key);
        return;
      }
      if (isInvestorApiFailure(r.value)) {
        partialErrors.push(key);
        return;
      }
      apiResponses[key] = r.value;
    });

    if (partialErrors.length === requests.length) {
      const firstRej = results.find((r) => r.status === "rejected");
      const msg = readErrorMessage(firstRej?.reason || new Error("Unable to load payments"));
      dispatch(
        investorPaymentsSuccess({
          partialErrors: null,
          loadError: msg,
          kpis: {},
          schedule: [],
          payoutHistory: [],
          receivableHealth: {},
          ledger: [],
          ledgerMeta: null,
          ledgerPeriodYear: null,
        })
      );
      dispatch(investorPaymentsLoading(false));
      return { fulfilled: false, message: msg };
    }

    const payload = buildPaymentsPagePayload(apiResponses, { partialErrors });

    dispatch(investorPaymentsSuccess(payload));
    dispatch(investorPaymentsLoading(false));
    return { fulfilled: true, partial: partialErrors.length > 0 };
  };

/** Financed investments for payment-schedule project picker. */
export const fetchInvestorFinancedInvestments = () => async () => {
  try {
    const response = await APIService.get(INVESTOR_API.projectsFinanced);
    const body = response.data;
    if (body?.status === false) {
      return { fulfilled: false, message: body.message || "Failed to load investments" };
    }
    const list = mapFinancedProjectsTiles(body.data ?? body);
    return { fulfilled: true, data: list };
  } catch (error) {
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

/** Full payout schedule for one investment. */
export const fetchInvestorProjectPayoutSchedule = (investmentId) => async () => {
  if (investmentId == null || investmentId === "") {
    return { fulfilled: false, message: "Investment is required" };
  }
  try {
    const response = await APIService.get(INVESTOR_API.paymentsProjectPayoutSchedule(investmentId));
    const body = response.data;
    if (body?.status === false) {
      return { fulfilled: false, message: body.message || "Failed to load payment schedule" };
    }
    return { fulfilled: true, data: mapProjectPayoutSchedule(body) };
  } catch (error) {
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const fetchInvestorAccountKyc = () => async (dispatch) => {
  dispatch(investorAccountKycLoading(true));
  try {
    // const response = await APIService.get("/api/v1/investor/account-kyc/");
    // dispatch(investorAccountKycSuccess(response.data));
    dispatch(investorAccountKycSuccess(MOCK_INVESTOR_ACCOUNT_KYC));
    return { fulfilled: true };
  } catch (error) {
    dispatch(investorAccountKycSuccess(MOCK_INVESTOR_ACCOUNT_KYC));
    return { fulfilled: false, message: error?.response?.data?.detail || error.message };
  } finally {
    dispatch(investorAccountKycLoading(false));
  }
};

const normalizeSupportPriority = (priority) => {
  const value = String(priority || "Normal").trim();
  if (value.toLowerCase() === "high") return "Urgent";
  return value;
};

/** GET investors/support-tickets/ */
export const fetchInvestorSupportTickets =
  (params = {}) =>
  async (dispatch) => {
    dispatch(investorSupportTicketsLoading(true));
    try {
      const search = new URLSearchParams();
      if (params.page != null) search.set("page", String(params.page));
      if (params.page_size != null) search.set("page_size", String(params.page_size));
      const qs = search.toString();
      const url = qs ? `${INVESTOR_API.supportTickets}?${qs}` : INVESTOR_API.supportTickets;
      const response = await APIService.get(url);
      const body = response.data;
      if (body?.status === false) {
        const message = body.message || "Failed to load support tickets";
        dispatch(investorSupportTicketsFail(message));
        return { fulfilled: false, message };
      }
      const list = mapInvestorSupportTicketsList(body.data ?? body);
      dispatch(investorSupportTicketsSuccess(list));
      return { fulfilled: true, data: list };
    } catch (error) {
      const message = readErrorMessage(error);
      dispatch(investorSupportTicketsFail(message));
      return { fulfilled: false, message };
    }
  };

/** GET investors/support-tickets/:id/ */
export const fetchInvestorSupportTicketDetail = (ticketId) => async (dispatch) => {
  dispatch(investorSupportTicketDetailLoading(true));
  try {
    const response = await APIService.get(INVESTOR_API.supportTicketDetail(ticketId));
    const body = response.data;
    dispatch(investorSupportTicketDetailLoading(false));
    if (body?.status === false) {
      return { fulfilled: false, message: body.message || "Failed to load ticket" };
    }
    const detail = mapInvestorSupportTicketDetail(body.data ?? body);
    dispatch(investorSupportTicketDetailSuccess(detail));
    return { fulfilled: true, data: detail };
  } catch (error) {
    dispatch(investorSupportTicketDetailLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const clearInvestorSupportTicketDetail = () => (dispatch) => {
  dispatch(investorSupportTicketDetailClear());
};

/** POST investors/support-tickets/ */
export const createInvestorSupportTicket = (payload) => async (dispatch) => {
  dispatch(investorSupportTicketCreateLoading(true));
  try {
    const bodyPayload = {
      topic: payload.topic,
      priority: normalizeSupportPriority(payload.priority),
      message: payload.message || "",
    };
    const response = await APIService.post(INVESTOR_API.supportTickets, bodyPayload);
    const body = response.data;
    dispatch(investorSupportTicketCreateLoading(false));
    if (body?.status === false) {
      return { fulfilled: false, message: body.message || "Could not create support ticket" };
    }
    await dispatch(fetchInvestorSupportTickets({ page: 1, page_size: 50 }));
    return {
      fulfilled: true,
      message: body.message || "Your request has been sent to Wyre support.",
      data: body.data,
    };
  } catch (error) {
    dispatch(investorSupportTicketCreateLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};
