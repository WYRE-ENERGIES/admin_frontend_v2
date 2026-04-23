import accessControlTypes from "../../reducers/accessControl/accessControl.type";

export const accessControlLoading = (payload = true) => ({
  type: accessControlTypes.ACCESS_CONTROL_LOADING,
  payload,
});

export const accessControlSuccess = (payload) => ({
  type: accessControlTypes.ACCESS_CONTROL_SUCCESS,
  payload,
});

export const accessControlFail = (payload) => ({
  type: accessControlTypes.ACCESS_CONTROL_FAIL,
  payload,
});

