import { APIService } from "../../../config/Api/apiServices";
import { INVESTOR_ADMIN_API } from "../../../config/Api/investorAdminApi";
import {
  clearAdminInvestorInvestmentDetail,
  createAdminInvestorInvestmentLoading,
  createAdminInvestorInvestmentSuccess,
  deleteAdminInvestorInvestmentLoading,
  deleteAdminInvestorInvestmentSuccess,
  getAdminInvestorInvestmentDetailLoading,
  getAdminInvestorInvestmentDetailSuccess,
  getAdminInvestorInvestmentsLoading,
  getAdminInvestorInvestmentsSuccess,
} from "./adminInvestorInvestment.creator";

const BASE = INVESTOR_ADMIN_API.investments;

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

export const fetchAdminInvestorInvestmentsList = () => async (dispatch) => {
  dispatch(getAdminInvestorInvestmentsLoading(true));
  try {
    const response = await APIService.get(BASE);
    const body = response.data;
    dispatch(getAdminInvestorInvestmentsLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Failed to load investments" };
    }
    dispatch(getAdminInvestorInvestmentsSuccess(body.data));
    return { fulfilled: true, data: body.data };
  } catch (error) {
    dispatch(getAdminInvestorInvestmentsLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const createAdminInvestorInvestment = (payload) => async (dispatch) => {
  dispatch(createAdminInvestorInvestmentLoading(true));
  try {
    const response = await APIService.post(BASE, payload);
    const body = response.data;
    dispatch(createAdminInvestorInvestmentLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Create failed" };
    }
    dispatch(createAdminInvestorInvestmentSuccess(body.data));
    return { fulfilled: true, message: body.message || "Created", data: body.data };
  } catch (error) {
    dispatch(createAdminInvestorInvestmentLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const fetchAdminInvestorInvestmentDetail = (id) => async (dispatch) => {
  dispatch(getAdminInvestorInvestmentDetailLoading(true));
  try {
    const response = await APIService.get(`${BASE}${id}/`);
    const body = response.data;
    dispatch(getAdminInvestorInvestmentDetailLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Failed to load" };
    }
    dispatch(getAdminInvestorInvestmentDetailSuccess(body.data));
    return { fulfilled: true, data: body.data };
  } catch (error) {
    dispatch(getAdminInvestorInvestmentDetailLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const clearInvestorInvestmentDetail = () => (dispatch) => {
  dispatch(clearAdminInvestorInvestmentDetail());
};

export const deleteAdminInvestorInvestment = (id) => async (dispatch) => {
  dispatch(deleteAdminInvestorInvestmentLoading(true));
  try {
    const response = await APIService.delete(`${BASE}${id}/`);
    const body = response.data;
    dispatch(deleteAdminInvestorInvestmentLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Delete failed" };
    }
    dispatch(deleteAdminInvestorInvestmentSuccess(body.data));
    return { fulfilled: true, message: body.message || "Deactivated", data: body.data };
  } catch (error) {
    dispatch(deleteAdminInvestorInvestmentLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};
