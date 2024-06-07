import { APIService } from "../../../config/Api/apiServices";
import { getLocationLoading, getLocationSuccess } from "./location.creator";

export const getLocationsData = (clientId, paginationQuery=1) => async (dispatch) => {

    dispatch(getLocationLoading(true));
  
    const requestUrl = `/api/v2/client-branches/${clientId}/?page=${paginationQuery}`;
    try {
      const response = await APIService.get(requestUrl);
  
      dispatch(getLocationSuccess(response.data));
  
      dispatch(getLocationLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(getLocationLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};