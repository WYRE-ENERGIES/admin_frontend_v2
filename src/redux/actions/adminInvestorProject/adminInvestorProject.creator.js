import adminInvestorProjectTypes from "../../reducers/adminInvestorProject/adminInvestorProject.type";

export const getAdminInvestorProjectsLoading = (payload = true) => ({
  type: adminInvestorProjectTypes.GET_ADMIN_INVESTOR_PROJECTS_LOADING,
  payload,
});

export const getAdminInvestorProjectsSuccess = (payload) => ({
  type: adminInvestorProjectTypes.GET_ADMIN_INVESTOR_PROJECTS_SUCCESS,
  payload,
});

export const createAdminInvestorProjectLoading = (payload = true) => ({
  type: adminInvestorProjectTypes.CREATE_ADMIN_INVESTOR_PROJECT_LOADING,
  payload,
});

export const createAdminInvestorProjectSuccess = (payload) => ({
  type: adminInvestorProjectTypes.CREATE_ADMIN_INVESTOR_PROJECT_SUCCESS,
  payload,
});

export const getAdminInvestorProjectDetailLoading = (payload = true) => ({
  type: adminInvestorProjectTypes.GET_ADMIN_INVESTOR_PROJECT_DETAIL_LOADING,
  payload,
});

export const getAdminInvestorProjectDetailSuccess = (payload) => ({
  type: adminInvestorProjectTypes.GET_ADMIN_INVESTOR_PROJECT_DETAIL_SUCCESS,
  payload,
});

export const clearAdminInvestorProjectDetail = () => ({
  type: adminInvestorProjectTypes.CLEAR_ADMIN_INVESTOR_PROJECT_DETAIL,
});

export const deleteAdminInvestorProjectLoading = (payload = true) => ({
  type: adminInvestorProjectTypes.DELETE_ADMIN_INVESTOR_PROJECT_LOADING,
  payload,
});

export const deleteAdminInvestorProjectSuccess = (payload) => ({
  type: adminInvestorProjectTypes.DELETE_ADMIN_INVESTOR_PROJECT_SUCCESS,
  payload,
});
