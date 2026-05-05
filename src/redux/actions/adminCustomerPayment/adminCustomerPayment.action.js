import { APIService } from "../../../config/Api/apiServices";
import { INVESTOR_ADMIN_API } from "../../../config/Api/investorAdminApi";
import {
  clearAdminCustomerPaymentDetail,
  createAdminCustomerPaymentLoading,
  createAdminCustomerPaymentSuccess,
  deleteAdminCustomerPaymentLoading,
  deleteAdminCustomerPaymentSuccess,
  getAdminCustomerPaymentDetailLoading,
  getAdminCustomerPaymentDetailSuccess,
  getAdminCustomerPaymentsLoading,
  getAdminCustomerPaymentsSuccess,
} from "./adminCustomerPayment.creator";

const BASE = INVESTOR_ADMIN_API.customerPayments;

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

export const fetchAdminCustomerPaymentsList = () => async (dispatch) => {
  dispatch(getAdminCustomerPaymentsLoading(true));
  try {
    const response = await APIService.get(BASE);
    const body = response.data;
    dispatch(getAdminCustomerPaymentsLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Failed to load payments" };
    }
    dispatch(getAdminCustomerPaymentsSuccess(body.data));
    return { fulfilled: true, data: body.data };
  } catch (error) {
    dispatch(getAdminCustomerPaymentsLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const createAdminCustomerPayment = (payload) => async (dispatch) => {
  dispatch(createAdminCustomerPaymentLoading(true));
  try {
    const response = await APIService.post(BASE, payload);
    const body = response.data;
    dispatch(createAdminCustomerPaymentLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Create failed" };
    }
    dispatch(createAdminCustomerPaymentSuccess(body.data));
    return { fulfilled: true, message: body.message || "Created", data: body.data };
  } catch (error) {
    dispatch(createAdminCustomerPaymentLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const fetchAdminCustomerPaymentDetail = (id) => async (dispatch) => {
  dispatch(getAdminCustomerPaymentDetailLoading(true));
  try {
    const response = await APIService.get(`${BASE}${id}/`);
    const body = response.data;
    dispatch(getAdminCustomerPaymentDetailLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Failed to load" };
    }
    dispatch(getAdminCustomerPaymentDetailSuccess(body.data));
    return { fulfilled: true, data: body.data };
  } catch (error) {
    dispatch(getAdminCustomerPaymentDetailLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const clearCustomerPaymentDetail = () => (dispatch) => {
  dispatch(clearAdminCustomerPaymentDetail());
};

export const deleteAdminCustomerPayment = (id) => async (dispatch) => {
  dispatch(deleteAdminCustomerPaymentLoading(true));
  try {
    const response = await APIService.delete(`${BASE}${id}/`);
    const body = response.data;
    dispatch(deleteAdminCustomerPaymentLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Delete failed" };
    }
    dispatch(deleteAdminCustomerPaymentSuccess(body.data));
    return { fulfilled: true, message: body.message || "Deactivated", data: body.data };
  } catch (error) {
    dispatch(deleteAdminCustomerPaymentLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};
