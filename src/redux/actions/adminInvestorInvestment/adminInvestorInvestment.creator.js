import adminInvestorInvestmentTypes from "../../reducers/adminInvestorInvestment/adminInvestorInvestment.type";

export const getAdminInvestorInvestmentsLoading = (payload = true) => ({
  type: adminInvestorInvestmentTypes.GET_ADMIN_INVESTOR_INVESTMENTS_LOADING,
  payload,
});

export const getAdminInvestorInvestmentsSuccess = (payload) => ({
  type: adminInvestorInvestmentTypes.GET_ADMIN_INVESTOR_INVESTMENTS_SUCCESS,
  payload,
});

export const createAdminInvestorInvestmentLoading = (payload = true) => ({
  type: adminInvestorInvestmentTypes.CREATE_ADMIN_INVESTOR_INVESTMENT_LOADING,
  payload,
});

export const createAdminInvestorInvestmentSuccess = (payload) => ({
  type: adminInvestorInvestmentTypes.CREATE_ADMIN_INVESTOR_INVESTMENT_SUCCESS,
  payload,
});

export const getAdminInvestorInvestmentDetailLoading = (payload = true) => ({
  type: adminInvestorInvestmentTypes.GET_ADMIN_INVESTOR_INVESTMENT_DETAIL_LOADING,
  payload,
});

export const getAdminInvestorInvestmentDetailSuccess = (payload) => ({
  type: adminInvestorInvestmentTypes.GET_ADMIN_INVESTOR_INVESTMENT_DETAIL_SUCCESS,
  payload,
});

export const clearAdminInvestorInvestmentDetail = () => ({
  type: adminInvestorInvestmentTypes.CLEAR_ADMIN_INVESTOR_INVESTMENT_DETAIL,
});

export const deleteAdminInvestorInvestmentLoading = (payload = true) => ({
  type: adminInvestorInvestmentTypes.DELETE_ADMIN_INVESTOR_INVESTMENT_LOADING,
  payload,
});

export const deleteAdminInvestorInvestmentSuccess = (payload) => ({
  type: adminInvestorInvestmentTypes.DELETE_ADMIN_INVESTOR_INVESTMENT_SUCCESS,
  payload,
});
