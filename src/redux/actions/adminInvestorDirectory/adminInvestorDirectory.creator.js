import adminInvestorDirectoryTypes from "../../reducers/adminInvestorDirectory/adminInvestorDirectory.type";

export const getAdminFinanceByInvestorLoading = (payload = true) => ({
  type: adminInvestorDirectoryTypes.GET_ADMIN_FINANCE_BY_INVESTOR_LOADING,
  payload,
});

export const getAdminFinanceByInvestorSuccess = (payload) => ({
  type: adminInvestorDirectoryTypes.GET_ADMIN_FINANCE_BY_INVESTOR_SUCCESS,
  payload,
});
