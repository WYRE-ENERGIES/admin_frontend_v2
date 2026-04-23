import { APIService } from "../../../config/Api/apiServices";
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
} from "./investor.creator";
import {
  mapCo2Card,
  mapFinancedProjectsTable,
  mapNotificationsToAlert,
  mapPerformanceSnapshotChart,
  mapPortfolioGenerationCard,
  mapRecentPaymentActivity,
  mapRepaymentTotalsCard,
  mapTotalInvestedCard,
} from "../../../helpers/investorPortfolioMappers";
import {
  MOCK_INVESTOR_ACCOUNT_KYC,
  MOCK_INVESTOR_PAYMENTS,
  MOCK_INVESTOR_PROJECTS,
} from "../../reducers/investor/investor.initialData";

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
      ["totalInvested", "/api/v1/investors/total-invested/"],
      ["portfolioGeneration", `/api/v1/investors/portfolio-generation/?${genQs}`],
      ["repaymentTotals", "/api/v1/investors/repayment-totals/"],
      ["co2", `/api/v1/investors/co2-offset/?${genQs}`],
      ["financedProjects", "/api/v1/investors/financed-projects/"],
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

    const payload = {
      partialErrors: errors.length ? errors : null,
      alert: mapNotificationsToAlert(raw.notifications),
      kpis: {
        totalInvested: mapTotalInvestedCard(raw.totalInvested),
        portfolioGeneration: mapPortfolioGenerationCard(raw.portfolioGeneration),
        repaymentTotals: mapRepaymentTotalsCard(raw.repaymentTotals),
        co2: mapCo2Card(raw.co2),
      },
      financedProjects: mapFinancedProjectsTable(raw.financedProjects),
      chartData: mapPerformanceSnapshotChart(raw.performanceSnapshot),
      activity: mapRecentPaymentActivity(raw.recentPaymentActivity),
    };

    dispatch(investorPortfolioOverviewSuccess(payload));
    dispatch(investorPortfolioOverviewLoading(false));
    return { fulfilled: true, partial: errors.length > 0 };
  };

/**
 * Wire to investor APIs when available. Until then, refresh state with mock payloads.
 */
export const fetchInvestorProjects = () => async (dispatch) => {
  dispatch(investorProjectsLoading(true));
  try {
    // const response = await APIService.get("/api/v1/investor/projects/");
    // dispatch(investorProjectsSuccess(response.data));
    dispatch(investorProjectsSuccess(MOCK_INVESTOR_PROJECTS));
    return { fulfilled: true };
  } catch (error) {
    dispatch(investorProjectsSuccess(MOCK_INVESTOR_PROJECTS));
    return { fulfilled: false, message: error?.response?.data?.detail || error.message };
  } finally {
    dispatch(investorProjectsLoading(false));
  }
};

export const fetchInvestorPayments = () => async (dispatch) => {
  dispatch(investorPaymentsLoading(true));
  try {
    // const response = await APIService.get("/api/v1/investor/payments/");
    // dispatch(investorPaymentsSuccess(response.data));
    dispatch(investorPaymentsSuccess(MOCK_INVESTOR_PAYMENTS));
    return { fulfilled: true };
  } catch (error) {
    dispatch(investorPaymentsSuccess(MOCK_INVESTOR_PAYMENTS));
    return { fulfilled: false, message: error?.response?.data?.detail || error.message };
  } finally {
    dispatch(investorPaymentsLoading(false));
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
