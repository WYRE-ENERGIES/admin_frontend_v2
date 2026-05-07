import adminInvestorPayoutTypes from "../../reducers/adminInvestorPayout/adminInvestorPayout.type";

export const getAdminInvestorPayoutsLoading = (payload = true) => ({
  type: adminInvestorPayoutTypes.GET_ADMIN_INVESTOR_PAYOUTS_LOADING,
  payload,
});

export const getAdminInvestorPayoutsSuccess = (payload) => ({
  type: adminInvestorPayoutTypes.GET_ADMIN_INVESTOR_PAYOUTS_SUCCESS,
  payload,
});

export const createAdminInvestorPayoutLoading = (payload = true) => ({
  type: adminInvestorPayoutTypes.CREATE_ADMIN_INVESTOR_PAYOUT_LOADING,
  payload,
});

export const createAdminInvestorPayoutSuccess = (payload) => ({
  type: adminInvestorPayoutTypes.CREATE_ADMIN_INVESTOR_PAYOUT_SUCCESS,
  payload,
});

export const getAdminInvestorPayoutDetailLoading = (payload = true) => ({
  type: adminInvestorPayoutTypes.GET_ADMIN_INVESTOR_PAYOUT_DETAIL_LOADING,
  payload,
});

export const getAdminInvestorPayoutDetailSuccess = (payload) => ({
  type: adminInvestorPayoutTypes.GET_ADMIN_INVESTOR_PAYOUT_DETAIL_SUCCESS,
  payload,
});

export const clearAdminInvestorPayoutDetail = () => ({
  type: adminInvestorPayoutTypes.CLEAR_ADMIN_INVESTOR_PAYOUT_DETAIL,
});

export const deleteAdminInvestorPayoutLoading = (payload = true) => ({
  type: adminInvestorPayoutTypes.DELETE_ADMIN_INVESTOR_PAYOUT_LOADING,
  payload,
});

export const deleteAdminInvestorPayoutSuccess = (payload) => ({
  type: adminInvestorPayoutTypes.DELETE_ADMIN_INVESTOR_PAYOUT_SUCCESS,
  payload,
});

export const updateAdminInvestorPayoutLoading = (payload = true) => ({
  type: adminInvestorPayoutTypes.UPDATE_ADMIN_INVESTOR_PAYOUT_LOADING,
  payload,
});

export const getAdminInvestorPaymentSchedulesListLoading = (payload = true) => ({
  type: adminInvestorPayoutTypes.GET_ADMIN_INVESTOR_PAYMENT_SCHEDULES_LIST_LOADING,
  payload,
});

export const getAdminInvestorPaymentSchedulesListSuccess = (payload) => ({
  type: adminInvestorPayoutTypes.GET_ADMIN_INVESTOR_PAYMENT_SCHEDULES_LIST_SUCCESS,
  payload,
});
