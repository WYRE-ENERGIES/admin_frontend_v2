import moment from "moment";
import { addUserBranchLoading, addUserBranchSuccess, addUsersLoading, addUsersSuccess, editUserLoading, editUserSuccess, getAllDevicesLoading, getAllDevicesSuccess, getDeviceConsumptionLoading, getDeviceConsumptionSuccess, getDeviceReadingsLoading, getDeviceReadingsSuccess, getDeviceSwitchLoading, getDeviceSwitchSuccess, getRolesLoading,  getRolesSuccess, loginUserLoading } from "./auth.creator";
import { APIService, APIServiceNoAuth } from "../../../config/Api/apiServices";
import jwt_decode from 'jwt-decode';

export const loginAUser = (parameters) => async (dispatch) => {
  dispatch(loginUserLoading(true));
  const requestUrl = '/api/v1/auth/';
  try {
    const response = await APIServiceNoAuth.post(requestUrl, parameters);
    
    // Decode the access token to get user details
    const decodedToken = jwt_decode(response.data.data.token.access);
    
    window.localStorage.setItem('loggedWyreUserAdmin', JSON.stringify(response.data?.data.token));
    window.localStorage.setItem('currentUser', JSON.stringify(decodedToken));
    
    dispatch(loginUserLoading(false));
    return { fulfilled: true, message: 'successful' };
  } catch (error) {
    console.error('Login error:', error);
    dispatch(loginUserLoading(false));
    return { fulfilled: false, message: error.response?.data?.detail || 'An error occurred during login' };
  }
};

/**
 * @description method to sign out a user
 * @returns {object} returns error or clears local storage
 */
 export const logUserOut = () => async (dispatch) => {
  try {
    
    localStorage.removeItem('loggedWyreUserAdmin');
    return window.location.href = '/';
  } catch (error) {
    return { signedOut: false, error: error.message };
  }
};

export const getAllRoles = () => async (dispatch) => {

  dispatch(getRolesLoading(true));
  const requestUrl = `/cadmin/roles`;
  try {
    const response = await APIService.get(requestUrl);

    dispatch(getRolesSuccess(response.data.authenticatedData));
    dispatch(getRolesLoading(false))
    return { fulfilled: true, message: 'successful' }
  } catch (error) {
    dispatch(getRolesLoading(false));
    return { fulfilled: false, message: error.response.data.detail }
  }
};

export const getDownloadAllDevices = () => async (dispatch) => {
  dispatch(getAllDevicesLoading(true));
  const requestUrl = `/api/v1/get_all_devices/12345678/`;
  try {
    const response = await APIService.get(requestUrl);
    dispatch(getAllDevicesSuccess(response.data));
    dispatch(getAllDevicesLoading(false));
    return { fulfilled: true, message: 'successful' };
  } catch (error) {
    dispatch(getAllDevicesLoading(false));
    return { fulfilled: false, message: error.response?.data?.detail || 'Failed to fetch devices.' };
  }
};

export const getDownloadDeviceReadings = (deviceId, userDateRange) => async (dispatch) => {
  dispatch(getDeviceReadingsLoading(true));
  const requestUrl = `/api/v1/get_device_readings/${deviceId}/${moment(userDateRange[0]).format('DD-MM-YYYY HH:mm') + '/' + moment(userDateRange[1]).format('DD-MM-YYYY HH:mm')}/`;
  try {
    const response = await APIService.get(requestUrl);
    dispatch(getDeviceReadingsSuccess(response.data.authenticatedData));
    dispatch(getDeviceReadingsLoading(false));
    return { fulfilled: true, message: 'successful', data: response.data };
  } catch (error) {
    dispatch(getDeviceReadingsLoading(false));
    return { fulfilled: false, message: error.response.data.detail };
  }
};

export const getDownloadDeviceConsumption = (deviceId, userDateRange, operatingTimeRange) => async (dispatch) => {
  dispatch(getDeviceConsumptionLoading(true));
  const requestUrl = `/api/v1/get_timed_device_readings/${deviceId}/${moment(userDateRange[0]).format('DD-MM-YYYY HH:mm') + '/' + moment(userDateRange[1]).format('DD-MM-YYYY HH:mm')}/${moment(operatingTimeRange[0]).format('HH') + '/' + moment(operatingTimeRange[1]).format('HH')}`;
  try {
    const response = await APIService.get(requestUrl);
    dispatch(getDeviceConsumptionSuccess(response.data.authenticatedData));
    dispatch(getDeviceConsumptionLoading(false));
    return { fulfilled: true, message: 'successful', data: response.data };
  } catch (error) {
    dispatch(getDeviceConsumptionLoading(false));
    return { fulfilled: false, message: error.response.data.detail };
  }
};

export const toggleNonPostingDevice = (deviceId) => async (dispatch) => {

  dispatch(getDeviceSwitchLoading(true));
  const requestUrl = `/api/v1/toggle_npa/${deviceId}/`;
  try {
    const response = await APIService.post(requestUrl);

    dispatch(getDeviceSwitchSuccess(response.data.authenticatedData));
    dispatch(getDeviceSwitchLoading(false))
    return { fulfilled: true, message: 'successful', data: response.data }
  } catch (error) {
    dispatch(getDeviceSwitchLoading(false));
    return { fulfilled: false, message: error.response.data.detail }
  }
};

export const addUsers = (parameters) => async (dispatch) => {
  dispatch(addUsersLoading(true));
  const requestUrl = `/cadmin/users/`;
  try {
    const response = await APIService.post(requestUrl, parameters);

    dispatch(addUsersSuccess(response.data.authenticatedData));
    dispatch(addUsersLoading(false))
    return { fulfilled: true, message: 'successful' }
  } catch (error) {
    dispatch(addUsersLoading(false));
    return { fulfilled: false, message: error.response.data.detail }
  }
};

export const addUserToBranch = (userId, values) => async (dispatch) => {
  dispatch(addUserBranchLoading(true));
  const requestUrl = `/cadmin/add_user/${userId}`;
  try {
    const response = await APIService.post(requestUrl, values);

    dispatch(addUserBranchSuccess(response.data.authenticatedData));
    dispatch(addUserBranchLoading(false))
    return { fulfilled: true, message: 'successful' }
  } catch (error) {
    dispatch(addUserBranchLoading(false));
    return { fulfilled: false, message: error.response.data.detail }
  }
};

export const updateUser = (parameters) => async (dispatch) => {
  dispatch(editUserLoading(true));
  const requestUrl = `/api/v1/user/35`;
  try {
    // const formData = multipartFormBuilder(parameters);
    // formData.set();

    const response = await APIService.put(requestUrl, parameters);

    dispatch(editUserSuccess(response.data));
    dispatch(editUserLoading(false))
    return { fulfilled: true, message: 'successful' }
  } catch (error) {
    dispatch(editUserLoading(false));
    return { fulfilled: false, message: error.response.data.detail }
  }
};