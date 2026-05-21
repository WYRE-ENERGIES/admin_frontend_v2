import { APIService } from "../../../config/Api/apiServices";
import { INVESTOR_ADMIN_API } from "../../../config/Api/investorAdminApi";
import {
  clearAdminSupportTicketDetail,
  createAdminSupportTicketResponseLoading,
  getAdminSupportTicketDetailLoading,
  getAdminSupportTicketDetailSuccess,
  getAdminSupportTicketsLoading,
  getAdminSupportTicketsSuccess,
} from "./adminInvestorSupportTicket.creator";

const BASE = INVESTOR_ADMIN_API.supportTickets;

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

export const fetchAdminSupportTicketsList = (params = {}) => async (dispatch) => {
  dispatch(getAdminSupportTicketsLoading(true));
  try {
    const search = new URLSearchParams();
    if (params.page != null) search.set("page", String(params.page));
    if (params.page_size != null) search.set("page_size", String(params.page_size));
    const qs = search.toString();
    const url = qs ? `${BASE}?${qs}` : BASE;
    const response = await APIService.get(url);
    const body = response.data;
    dispatch(getAdminSupportTicketsLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Failed to load tickets" };
    }
    dispatch(getAdminSupportTicketsSuccess(body.data));
    return { fulfilled: true, data: body.data };
  } catch (error) {
    dispatch(getAdminSupportTicketsLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const fetchAdminSupportTicketDetail = (id) => async (dispatch) => {
  dispatch(getAdminSupportTicketDetailLoading(true));
  try {
    const response = await APIService.get(`${BASE}${id}/`);
    const body = response.data;
    dispatch(getAdminSupportTicketDetailLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Failed to load ticket" };
    }
    dispatch(getAdminSupportTicketDetailSuccess(body.data));
    return { fulfilled: true, data: body.data };
  } catch (error) {
    dispatch(getAdminSupportTicketDetailLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

export const clearSupportTicketDetail = () => (dispatch) => {
  dispatch(clearAdminSupportTicketDetail());
};

export const createAdminSupportTicketResponse = (id, payload) => async (dispatch) => {
  dispatch(createAdminSupportTicketResponseLoading(true));
  try {
    const response = await APIService.post(`${BASE}${id}/responses/`, payload);
    const body = response.data;
    dispatch(createAdminSupportTicketResponseLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Failed to post response" };
    }
    return { fulfilled: true, message: body.message || "Created", data: body.data };
  } catch (error) {
    dispatch(createAdminSupportTicketResponseLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};
