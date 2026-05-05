import { APIService } from "../../../config/Api/apiServices";
import { INVESTOR_ADMIN_API } from "../../../config/Api/investorAdminApi";
import {
  clearAdminInvestorUserDetail,
  createAdminInvestorUserLoading,
  createAdminInvestorUserSuccess,
  deleteAdminInvestorUserLoading,
  deleteAdminInvestorUserSuccess,
  getAdminInvestorUserDetailLoading,
  getAdminInvestorUserDetailSuccess,
  getAdminInvestorUsersLoading,
  getAdminInvestorUsersSuccess,
} from "./adminInvestorUser.creator";

const BASE = INVESTOR_ADMIN_API.investorUsers;

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

export const fetchAdminInvestorUsersList = () => async (dispatch) => {
  dispatch(getAdminInvestorUsersLoading(true));
  try {
    const response = await APIService.get(BASE);
    const body = response.data;
    dispatch(getAdminInvestorUsersLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Failed to load investors" };
    }
    dispatch(getAdminInvestorUsersSuccess(body.data));
    return { fulfilled: true, data: body.data };
  } catch (error) {
    dispatch(getAdminInvestorUsersLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const createAdminInvestorUser = (payload) => async (dispatch) => {
  dispatch(createAdminInvestorUserLoading(true));
  try {
    const response = await APIService.post(BASE, payload);
    const body = response.data;
    dispatch(createAdminInvestorUserLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Create failed" };
    }
    dispatch(createAdminInvestorUserSuccess(body.data));
    return { fulfilled: true, message: body.message || "Created", data: body.data };
  } catch (error) {
    dispatch(createAdminInvestorUserLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const fetchAdminInvestorUserDetail = (id) => async (dispatch) => {
  dispatch(getAdminInvestorUserDetailLoading(true));
  try {
    const response = await APIService.get(`${BASE}${id}/`);
    const body = response.data;
    dispatch(getAdminInvestorUserDetailLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Failed to load" };
    }
    dispatch(getAdminInvestorUserDetailSuccess(body.data));
    return { fulfilled: true, data: body.data };
  } catch (error) {
    dispatch(getAdminInvestorUserDetailLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const clearInvestorUserDetail = () => (dispatch) => {
  dispatch(clearAdminInvestorUserDetail());
};

export const deleteAdminInvestorUser = (id) => async (dispatch) => {
  dispatch(deleteAdminInvestorUserLoading(true));
  try {
    const response = await APIService.delete(`${BASE}${id}/`);
    const body = response.data;
    dispatch(deleteAdminInvestorUserLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Delete failed" };
    }
    dispatch(deleteAdminInvestorUserSuccess(body.data));
    return { fulfilled: true, message: body.message || "Deactivated", data: body.data };
  } catch (error) {
    dispatch(deleteAdminInvestorUserLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};
