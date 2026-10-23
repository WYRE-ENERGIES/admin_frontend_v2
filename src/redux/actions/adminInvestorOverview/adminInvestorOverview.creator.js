import adminInvestorOverviewTypes from "../../reducers/adminInvestorOverview/adminInvestorOverview.type";

export const getAdminInvestorOverviewLoading = (payload = true) => ({
  type: adminInvestorOverviewTypes.GET_ADMIN_INVESTOR_OVERVIEW_LOADING,
  payload,
});

export const getAdminInvestorOverviewSuccess = (payload) => ({
  type: adminInvestorOverviewTypes.GET_ADMIN_INVESTOR_OVERVIEW_SUCCESS,
  payload,
});
