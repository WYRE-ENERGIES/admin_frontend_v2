import adminInvestorUserTypes from "../../reducers/adminInvestorUser/adminInvestorUser.type";

export const getAdminInvestorUsersLoading = (payload = true) => ({
  type: adminInvestorUserTypes.GET_ADMIN_INVESTOR_USERS_LOADING,
  payload,
});

export const getAdminInvestorUsersSuccess = (payload) => ({
  type: adminInvestorUserTypes.GET_ADMIN_INVESTOR_USERS_SUCCESS,
  payload,
});

export const createAdminInvestorUserLoading = (payload = true) => ({
  type: adminInvestorUserTypes.CREATE_ADMIN_INVESTOR_USER_LOADING,
  payload,
});

export const createAdminInvestorUserSuccess = (payload) => ({
  type: adminInvestorUserTypes.CREATE_ADMIN_INVESTOR_USER_SUCCESS,
  payload,
});

export const getAdminInvestorUserDetailLoading = (payload = true) => ({
  type: adminInvestorUserTypes.GET_ADMIN_INVESTOR_USER_DETAIL_LOADING,
  payload,
});

export const getAdminInvestorUserDetailSuccess = (payload) => ({
  type: adminInvestorUserTypes.GET_ADMIN_INVESTOR_USER_DETAIL_SUCCESS,
  payload,
});

export const clearAdminInvestorUserDetail = () => ({
  type: adminInvestorUserTypes.CLEAR_ADMIN_INVESTOR_USER_DETAIL,
});

export const deleteAdminInvestorUserLoading = (payload = true) => ({
  type: adminInvestorUserTypes.DELETE_ADMIN_INVESTOR_USER_LOADING,
  payload,
});

export const deleteAdminInvestorUserSuccess = (payload) => ({
  type: adminInvestorUserTypes.DELETE_ADMIN_INVESTOR_USER_SUCCESS,
  payload,
});
