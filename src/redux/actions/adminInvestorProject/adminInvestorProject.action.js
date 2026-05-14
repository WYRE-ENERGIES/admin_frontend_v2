import { APIService } from "../../../config/Api/apiServices";
import { INVESTOR_ADMIN_API } from "../../../config/Api/investorAdminApi";
import {
  clearAdminInvestorProjectDetail,
  createAdminInvestorProjectLoading,
  createAdminInvestorProjectSuccess,
  deleteAdminInvestorProjectLoading,
  deleteAdminInvestorProjectSuccess,
  getAdminProjectsPerformanceLoading,
  getAdminProjectsPerformanceSuccess,
  getAdminInvestorProjectDetailLoading,
  getAdminInvestorProjectDetailSuccess,
  getAdminInvestorProjectsLoading,
  getAdminInvestorProjectsSuccess,
  updateAdminInvestorProjectLoading,
} from "./adminInvestorProject.creator";

const BASE = INVESTOR_ADMIN_API.projects;
const PERFORMANCE_BASE = `${INVESTOR_ADMIN_API.projects}performance/`;

const readErrorMessage = (error) => {
  const data = error.response?.data;
  if (!data) return error.message || "Request failed";
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail.map((d) => d.msg || d).join("; ");
  }
  if (data.message) return typeof data.message === "string" ? data.message : JSON.stringify(data.message);
  return error.message || "Request failed";
};

export const fetchAdminInvestorProjectsList = () => async (dispatch) => {
  dispatch(getAdminInvestorProjectsLoading(true));
  try {
    const response = await APIService.get(BASE);
    const body = response.data;
    dispatch(getAdminInvestorProjectsLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Failed to load projects" };
    }
    dispatch(getAdminInvestorProjectsSuccess(body.data));
    return { fulfilled: true, data: body.data };
  } catch (error) {
    dispatch(getAdminInvestorProjectsLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const createAdminInvestorProject = (payload) => async (dispatch) => {
  dispatch(createAdminInvestorProjectLoading(true));
  try {
    const response = await APIService.post(BASE, payload);
    const body = response.data;
    dispatch(createAdminInvestorProjectLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Create failed" };
    }
    dispatch(createAdminInvestorProjectSuccess(body.data));
    return { fulfilled: true, message: body.message || "Created", data: body.data };
  } catch (error) {
    dispatch(createAdminInvestorProjectLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const fetchAdminInvestorProjectDetail = (id) => async (dispatch) => {
  dispatch(getAdminInvestorProjectDetailLoading(true));
  try {
    const response = await APIService.get(`${BASE}${id}/`);
    const body = response.data;
    dispatch(getAdminInvestorProjectDetailLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Failed to load" };
    }
    dispatch(getAdminInvestorProjectDetailSuccess(body.data));
    return { fulfilled: true, data: body.data };
  } catch (error) {
    dispatch(getAdminInvestorProjectDetailLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const clearInvestorProjectDetail = () => (dispatch) => {
  dispatch(clearAdminInvestorProjectDetail());
};

export const deleteAdminInvestorProject = (id) => async (dispatch) => {
  dispatch(deleteAdminInvestorProjectLoading(true));
  try {
    const response = await APIService.delete(`${BASE}${id}/`);
    const body = response.data;
    dispatch(deleteAdminInvestorProjectLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Delete failed" };
    }
    dispatch(deleteAdminInvestorProjectSuccess(body.data));
    return { fulfilled: true, message: body.message || "Deactivated", data: body.data };
  } catch (error) {
    dispatch(deleteAdminInvestorProjectLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const updateAdminInvestorProject = (id, payload) => async (dispatch) => {
  dispatch(updateAdminInvestorProjectLoading(true));
  try {
    const response = await APIService.patch(`${BASE}${id}/`, payload);
    const body = response.data;
    dispatch(updateAdminInvestorProjectLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Update failed" };
    }
    dispatch(getAdminInvestorProjectDetailSuccess(body.data));
    return { fulfilled: true, message: body.message || "Updated", data: body.data };
  } catch (error) {
    dispatch(updateAdminInvestorProjectLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const fetchAdminInvestorProjectsPerformance =
  ({ rank_by = "average_daily_generation_kwh" } = {}) =>
  async (dispatch) => {
    dispatch(getAdminProjectsPerformanceLoading(true));
    try {
      const response = await APIService.get(`${PERFORMANCE_BASE}?rank_by=${encodeURIComponent(String(rank_by))}`);
      const body = response.data;
      dispatch(getAdminProjectsPerformanceLoading(false));
      if (body.status === false) {
        return { fulfilled: false, message: body.message || "Failed to load project performance" };
      }
      dispatch(getAdminProjectsPerformanceSuccess(body.data));
      return { fulfilled: true, data: body.data };
    } catch (error) {
      dispatch(getAdminProjectsPerformanceLoading(false));
      return { fulfilled: false, message: readErrorMessage(error) };
    }
  };
