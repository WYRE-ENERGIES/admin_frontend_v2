import { APIService } from "../../../config/Api/apiServices";
import { INVESTOR_ADMIN_API } from "../../../config/Api/investorAdminApi";
import {
  clearAdminInvestorPayoutDetail,
  createAdminInvestorPayoutLoading,
  createAdminInvestorPayoutSuccess,
  deleteAdminInvestorPayoutLoading,
  deleteAdminInvestorPayoutSuccess,
  getAdminInvestorPayoutDetailLoading,
  getAdminInvestorPayoutDetailSuccess,
  getAdminInvestorPayoutsLoading,
  getAdminInvestorPayoutsSuccess,
  getAdminInvestorPaymentSchedulesListLoading,
  getAdminInvestorPaymentSchedulesListSuccess,
  updateAdminInvestorPayoutLoading,
} from "./adminInvestorPayout.creator";

const PAYOUTS_BASE = INVESTOR_ADMIN_API.investorPayouts;
const SCHEDULES_BASE = INVESTOR_ADMIN_API.investorPaymentSchedules;

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

/** GET schedules for an investment (and optionally customer context); returns { results, count, investment_id, project_id } */
export const fetchInvestorPaymentSchedules = (investmentId) => async () => {
  try {
    const response = await APIService.get(
      `${SCHEDULES_BASE}?investment_id=${encodeURIComponent(String(investmentId))}`
    );
    const body = response.data;
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Failed to load schedules" };
    }
    return { fulfilled: true, data: body.data };
  } catch (error) {
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const fetchAdminInvestorPayoutsList = () => async (dispatch) => {
  dispatch(getAdminInvestorPayoutsLoading(true));
  try {
    const response = await APIService.get(PAYOUTS_BASE);
    const body = response.data;
    dispatch(getAdminInvestorPayoutsLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Failed to load payouts" };
    }
    dispatch(getAdminInvestorPayoutsSuccess(body.data));
    return { fulfilled: true, data: body.data };
  } catch (error) {
    dispatch(getAdminInvestorPayoutsLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const createAdminInvestorPayout = (payload) => async (dispatch) => {
  dispatch(createAdminInvestorPayoutLoading(true));
  try {
    const response = await APIService.post(PAYOUTS_BASE, payload);
    const body = response.data;
    dispatch(createAdminInvestorPayoutLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Create failed" };
    }
    dispatch(createAdminInvestorPayoutSuccess(body.data));
    return { fulfilled: true, message: body.message || "Created", data: body.data };
  } catch (error) {
    dispatch(createAdminInvestorPayoutLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const fetchAdminInvestorPayoutDetail = (id) => async (dispatch) => {
  dispatch(getAdminInvestorPayoutDetailLoading(true));
  try {
    const response = await APIService.get(`${PAYOUTS_BASE}${id}/`);
    const body = response.data;
    dispatch(getAdminInvestorPayoutDetailLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Failed to load" };
    }
    dispatch(getAdminInvestorPayoutDetailSuccess(body.data));
    return { fulfilled: true, data: body.data };
  } catch (error) {
    dispatch(getAdminInvestorPayoutDetailLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const clearInvestorPayoutDetail = () => (dispatch) => {
  dispatch(clearAdminInvestorPayoutDetail());
};

export const deleteAdminInvestorPayout = (id) => async (dispatch) => {
  dispatch(deleteAdminInvestorPayoutLoading(true));
  try {
    const response = await APIService.delete(`${PAYOUTS_BASE}${id}/`);
    const body = response.data;
    dispatch(deleteAdminInvestorPayoutLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Delete failed" };
    }
    dispatch(deleteAdminInvestorPayoutSuccess(body.data));
    return { fulfilled: true, message: body.message || "Deactivated", data: body.data };
  } catch (error) {
    dispatch(deleteAdminInvestorPayoutLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

/** GET all investor repayment schedule lines (paginated). Optional: investment_id, investor_id, project_id, page, page_size */
export const fetchAdminInvestorPaymentSchedulesList = (params = {}) => async (dispatch) => {
  dispatch(getAdminInvestorPaymentSchedulesListLoading(true));
  try {
    const search = new URLSearchParams();
    if (params.page != null) search.set("page", String(params.page));
    if (params.page_size != null) search.set("page_size", String(params.page_size));
    if (params.investment_id != null) search.set("investment_id", String(params.investment_id));
    if (params.investor_id != null) search.set("investor_id", String(params.investor_id));
    if (params.project_id != null) search.set("project_id", String(params.project_id));
    const qs = search.toString();
    const url = qs ? `${SCHEDULES_BASE}?${qs}` : SCHEDULES_BASE;
    const response = await APIService.get(url);
    const body = response.data;
    dispatch(getAdminInvestorPaymentSchedulesListLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Failed to load schedules" };
    }
    dispatch(getAdminInvestorPaymentSchedulesListSuccess(body.data));
    return { fulfilled: true, data: body.data };
  } catch (error) {
    dispatch(getAdminInvestorPaymentSchedulesListLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const updateAdminInvestorPayout = (id, payload) => async (dispatch) => {
  dispatch(updateAdminInvestorPayoutLoading(true));
  try {
    const response = await APIService.patch(`${PAYOUTS_BASE}${id}/`, payload);
    const body = response.data;
    dispatch(updateAdminInvestorPayoutLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Update failed" };
    }
    dispatch(getAdminInvestorPayoutDetailSuccess(body.data));
    return { fulfilled: true, message: body.message || "Updated", data: body.data };
  } catch (error) {
    dispatch(updateAdminInvestorPayoutLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};
