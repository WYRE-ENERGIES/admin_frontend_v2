import { APIService } from "../../../config/Api/apiServices";
import { editTargetLoading, editTargetSuccess, getTargetLoading, getTargetSuccess, setTargetLoading, setTargetSuccess } from "./target.creator";

export const setTargetData = (clientId, values) => async (dispatch) => {

    dispatch(setTargetLoading(true));
  
    const requestUrl = `/api/v2/target/${clientId}/`;
    try {
      const response = await APIService.post(requestUrl, values);
  
      dispatch(setTargetSuccess(response.data));
  
      dispatch(setTargetLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(setTargetLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const getTargetData = (clientId) => async (dispatch) => {

    dispatch(getTargetLoading(true));
  
    const requestUrl = `/api/v2/target/${clientId}/`;
    try {
      const response = await APIService.get(requestUrl);
  
      dispatch(getTargetSuccess(response.data));
  
      dispatch(getTargetLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(getTargetLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const updateTargetData = (clientId, values) => async (dispatch) => {

  dispatch(editTargetLoading(true));

  const requestUrl = `/api/v2/target/${clientId}/`;
  try {
    const response = await APIService.patch(requestUrl, values);

    dispatch(editTargetSuccess(response.data));

    dispatch(editTargetLoading(false))
    return { fulfilled: true, message: 'successful' }
  } catch (error) {
    dispatch(editTargetLoading(false));
    return { fulfilled: false, message: error.response.data.detail }
  }
};