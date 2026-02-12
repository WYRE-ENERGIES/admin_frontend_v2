import { APIService } from "../../../config/Api/apiServices";
import { addRegionLoading, addRegionSuccess, deleteRegionLoading, deleteRegionSuccess, editLocationLoading, editLocationSuccess, editRegionLoading, editRegionSuccess, getClientRegionsLoading, getClientRegionsSuccess, getLocationLoading, getLocationSuccess, getRegionLoading, getRegionSuccess } from "./location.creator";

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

export const addALocation = (branchId, values) => async (dispatch) => {

    dispatch(editLocationLoading(true));
  
    const requestUrl = `/api/v1/create-branch/client/${branchId}/`;
    try {
      const response = await APIService.put(requestUrl, values);
  
      dispatch(editLocationSuccess(response.data));
  
      dispatch(editLocationLoading(false))
      return { fulfilled: true, message: 'successful', data: response.data }
    } catch (error) {
      dispatch(editLocationLoading(false));     
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const updateALocation = (branchId, values) => async (dispatch) => {

    dispatch(editLocationLoading(true));
  
    const requestUrl = `/api/v1/branch/${branchId}/`;
    try {
      const response = await APIService.put(requestUrl, values);
  
      dispatch(editLocationSuccess(response.data));
  
      dispatch(editLocationLoading(false))
      return { fulfilled: true, message: 'successful', data: response.data }
    } catch (error) {
      dispatch(editLocationLoading(false));     
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const clearClientRegions = () => (dispatch) => {
    dispatch(getClientRegionsSuccess([]));
};

export const getClientRegionsData = (clientId) => async (dispatch) => {
    dispatch(getClientRegionsLoading(true));
    const requestUrl = `/api/v1/accounts/client/${clientId}/regions/`;
    try {
      const response = await APIService.get(requestUrl);
      let regionsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          regionsData = response.data;
        } else if (response.data.regions && Array.isArray(response.data.regions)) {
          regionsData = response.data.regions;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          regionsData = response.data.data;
        }
      }
      dispatch(getClientRegionsSuccess(regionsData));
      dispatch(getClientRegionsLoading(false));
      return { fulfilled: true, data: regionsData };
    } catch (error) {
      dispatch(getClientRegionsSuccess([]));
      dispatch(getClientRegionsLoading(false));
      return { fulfilled: false, message: error.response?.data?.detail };
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

export const addARegionssssssss = (clientId) => async (dispatch) => {
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

export const addARegion = (clientId, values) => async (dispatch) => {

    dispatch(addRegionLoading(true));
  
    const requestUrl = `/api/v1/accounts/client/${clientId}/add-regions/`;
    try {
      const response = await APIService.post(requestUrl, values);
  
      dispatch(addRegionSuccess(response.data));
  
      dispatch(addRegionLoading(false))
      return { fulfilled: true, message: 'successful', data: response.data }
    } catch (error) {
      dispatch(addRegionLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const updateARegion = (regionId, values) => async (dispatch) => {

    dispatch(editRegionLoading(true));
  
    const requestUrl = `/api/v1/accounts/region/${regionId}/`;
    try {
      const response = await APIService.put(requestUrl, values);
  
      dispatch(editRegionSuccess(response.data));
  
      dispatch(editRegionLoading(false))
      return { fulfilled: true, message: 'successful', data: response.data }
    } catch (error) {
      dispatch(editRegionLoading(false));     
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const deleteARegion = (regionId) => async (dispatch) => {

    dispatch(deleteRegionLoading(true));
  
    const requestUrl = `/api/v1/accounts/region/${regionId}/`;
    try {
      const response = await APIService.delete(requestUrl);
  
      dispatch(deleteRegionSuccess(response.data));
  
      dispatch(deleteRegionLoading(false))
      return { fulfilled: true, message: 'successful', data: response.data }
    } catch (error) {
      dispatch(deleteRegionLoading(false));     
      return { fulfilled: false, message: error.response.data.detail }
    }
};