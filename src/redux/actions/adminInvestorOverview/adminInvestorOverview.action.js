import { APIService } from "../../../config/Api/apiServices";
import { INVESTOR_ADMIN_API } from "../../../config/Api/investorAdminApi";
import {
  getAdminInvestorOverviewLoading,
  getAdminInvestorOverviewSuccess,
} from "./adminInvestorOverview.creator";

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

const getOverview = async (url) => {
  const response = await APIService.get(url);
  const body = response.data;
  if (body.status === false) {
    throw new Error(body.message || "Request failed");
  }
  return body.data;
};

/** Loads all five overview KPI segments in parallel. */
export const fetchAdminInvestorOverview = () => async (dispatch) => {
  dispatch(getAdminInvestorOverviewLoading(true));
  const o = INVESTOR_ADMIN_API.overview;
  try {
    const [totalInvested, customersExpected, activeProjects, activeInvestors, nearestPayments] = await Promise.all([
      getOverview(o.totalInvested),
      getOverview(o.customersExpected),
      getOverview(o.activeProjects),
      getOverview(o.activeInvestors),
      getOverview(o.nearestPayments),
    ]);
    dispatch(
      getAdminInvestorOverviewSuccess({
        totalInvested,
        customersExpected,
        activeProjects,
        activeInvestors,
        nearestPayments,
      })
    );
    return { fulfilled: true };
  } catch (error) {
    dispatch(getAdminInvestorOverviewLoading(false));
    return { fulfilled: false, message: readErrorMessage(error) };
  }
};
