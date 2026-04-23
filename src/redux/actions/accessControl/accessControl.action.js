import { APIService } from "../../../config/Api/apiServices";
import {
  accessControlFail,
  accessControlLoading,
  accessControlSuccess,
} from "./accessControl.creator";
import { MOCK_ACCESS_CONTROL } from "../../reducers/accessControl/accessControl.initialData";

const extractErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.detail ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

/**
 * Admin access control (SUPERADMIN): endpoints TBD.
 * For now, hydrate UI with mock data while preserving the app's Redux pattern.
 */
export const fetchAccessControlOverview = () => async (dispatch) => {
  dispatch(accessControlLoading(true));
  try {
    // Future:
    // const resp = await APIService.get("/api/v1/admin/access-control/");
    // dispatch(accessControlSuccess(resp.data));

    dispatch(accessControlSuccess(MOCK_ACCESS_CONTROL));
    return { fulfilled: true, data: MOCK_ACCESS_CONTROL };
  } catch (error) {
    const message = extractErrorMessage(error, "Could not load access control.");
    dispatch(accessControlFail(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(accessControlLoading(false));
  }
};

/**
 * Placeholder mutations (local-only for now). Keep action signatures stable for later API wiring.
 */
export const updateAccessControlLocal = (nextData) => async (dispatch) => {
  dispatch(accessControlSuccess(nextData));
  return { fulfilled: true };
};

