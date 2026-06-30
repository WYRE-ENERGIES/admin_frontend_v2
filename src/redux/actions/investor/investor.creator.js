import investorTypes from "../../reducers/investor/investor.type";

export const investorPortfolioOverviewLoading = (payload = true) => ({
  type: investorTypes.INVESTOR_PORTFOLIO_OVERVIEW_LOADING,
  payload,
});

export const investorPortfolioOverviewSuccess = (payload) => ({
  type: investorTypes.INVESTOR_PORTFOLIO_OVERVIEW_SUCCESS,
  payload,
});

export const investorPortfolioOverviewFail = (payload) => ({
  type: investorTypes.INVESTOR_PORTFOLIO_OVERVIEW_FAIL,
  payload,
});

export const investorProjectsLoading = (payload = true) => ({
  type: investorTypes.INVESTOR_PROJECTS_LOADING,
  payload,
});

export const investorProjectsSuccess = (payload) => ({
  type: investorTypes.INVESTOR_PROJECTS_SUCCESS,
  payload,
});

export const investorPaymentsLoading = (payload = true) => ({
  type: investorTypes.INVESTOR_PAYMENTS_LOADING,
  payload,
});

export const investorPaymentsSuccess = (payload) => ({
  type: investorTypes.INVESTOR_PAYMENTS_SUCCESS,
  payload,
});

export const investorAccountKycLoading = (payload = true) => ({
  type: investorTypes.INVESTOR_ACCOUNT_KYC_LOADING,
  payload,
});

export const investorAccountKycSuccess = (payload) => ({
  type: investorTypes.INVESTOR_ACCOUNT_KYC_SUCCESS,
  payload,
});

export const investorTotalDepositedSuccess = (payload) => ({
  type: investorTypes.INVESTOR_TOTAL_DEPOSITED_SUCCESS,
  payload,
});
