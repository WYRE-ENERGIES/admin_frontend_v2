import { APIService } from "../../../config/Api/apiServices";
import { INVESTOR_ADMIN_API } from "../../../config/Api/investorAdminApi";
import { getAdminFinanceByInvestorLoading, getAdminFinanceByInvestorSuccess } from "./adminInvestorDirectory.creator";

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

export const fetchAdminFinanceByInvestor = () => async (dispatch) => {
  dispatch(getAdminFinanceByInvestorLoading(true));
  try {
    const response = await APIService.get(INVESTOR_ADMIN_API.directory.financeByInvestor);
    const body = response.data;
    dispatch(getAdminFinanceByInvestorLoading(false));
    if (body.status === false) {
      return { fulfilled: false, message: body.message || "Failed to load" };
    }
    dispatch(getAdminFinanceByInvestorSuccess(body.data));
    return { fulfilled: true, data: body.data };
  } catch (error) {
    dispatch(getAdminFinanceByInvestorLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};

