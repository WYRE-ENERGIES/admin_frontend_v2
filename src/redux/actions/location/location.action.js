import { APIService } from "../../../config/Api/apiServices";
import { addRegionLoading, addRegionSuccess, getLocationLoading, getLocationSuccess, getRegionLoading, getRegionSuccess } from "./location.creator";

export const getLocationsData = (clientId, paginationQuery=1) => async (dispatch) => {
    dispatch(getLocationLoading(true));
  
    const requestUrl = `/api/v2/client-branches/${clientId}/?page=${paginationQuery}`;
    try {
      const response = await APIService.get(requestUrl);
  
      dispatch(getLocationSuccess(response.data));
  
      dispatch(getLocationLoading(false))
      return { fulfilled: true, message: 'successful', data: response.data }
    } catch (error) {
      dispatch(getLocationLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const getRegionsListData = (clientId) => async (dispatch) => {
    dispatch(getRegionLoading(true));
    const requestUrl = `/api/v1/client/${clientId}/regions-branches/`;
    try {
      const response = await APIService.get(requestUrl);
  
      dispatch(getRegionSuccess(response.data));
  
      dispatch(getRegionLoading(false))
      return { fulfilled: true, message: 'successful', data: response.data }
    } catch (error) {
      dispatch(getRegionLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const addARegion = (clientId) => async (dispatch) => {
    dispatch(addRegionLoading(true));
    const requestUrl = `/api/v1/accounts/client/${clientId}/add-regions/`;
    try {
      const response = await APIService.post(requestUrl);
  
      dispatch(addRegionSuccess(response.data));
  
      dispatch(addRegionLoading(false))
      return { fulfilled: true, message: 'successful', data: response.data }
    } catch (error) {
      dispatch(addRegionLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};