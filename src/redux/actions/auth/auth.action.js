import moment from "moment";
import { addUserBranchLoading, addUserBranchSuccess, addUsersLoading, addUsersSuccess, editUserLoading, editUserSuccess, getAllDevicesLoading, getAllDevicesSuccess, getDeviceConsumptionLoading, getDeviceConsumptionSuccess, getDeviceReadingsLoading, getDeviceReadingsSuccess, getDeviceSwitchLoading, getDeviceSwitchSuccess, getRolesLoading,  getRolesSuccess, loginUserLoading, updateProfileLoading, updateProfileSuccess, updatePasswordLoading, updatePasswordSuccess, resetPasswordLoading, resetPasswordSuccess, confirmResetPasswordLoading, confirmResetPasswordSuccess, validateResetTokenLoading, validateResetTokenSuccess } from "./auth.creator";
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
    dispatch(loginUserLoading(false));
    return { fulfilled: false, message: error.response?.data?.error || 'An error occurred during login' };
  }
};

/**
 * @description method to sign out a user
 * @returns {object} returns error or clears local storage
 */
 export const logUserOut = () => async (dispatch) => {
  try {
    
    localStorage.removeItem('loggedWyreUserAdmin');
    localStorage.removeItem('currentUser');
    return window.location.href = '/';
  } catch (error) {
    return { signedOut: false, error: error.message };
  }
};

export const getAllRoles = () => async (dispatch) => {

  dispatch(getRolesLoading(true));
  const requestUrl = `/api/v1/roles`;
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
  const requestUrl = `/api/v1/get_all_devices/`;
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
  const startDate = userDateRange[0].format ? userDateRange[0].format('DD-MM-YYYY HH:mm') : moment(userDateRange[0]).format('DD-MM-YYYY HH:mm');
  const endDate = userDateRange[1].format ? userDateRange[1].format('DD-MM-YYYY HH:mm') : moment(userDateRange[1]).format('DD-MM-YYYY HH:mm');
  const requestUrl = `/api/v1/get_device_readings/${deviceId}/${startDate}/${endDate}/`;
  try {
    const response = await APIService.get(requestUrl);
    dispatch(getDeviceReadingsSuccess(response.data));
    dispatch(getDeviceReadingsLoading(false));
    return { fulfilled: true, message: 'successful', data: response.data };
  } catch (error) {
    dispatch(getDeviceReadingsLoading(false));
    return { fulfilled: false, message: error.response?.data?.detail || error.message };
  }
};

export const getDownloadDeviceConsumption = (deviceId, userDateRange, operatingTimeRange) => async (dispatch) => {
  dispatch(getDeviceConsumptionLoading(true));
  const startDate = userDateRange[0].format ? userDateRange[0].format('DD-MM-YYYY HH:mm') : moment(userDateRange[0]).format('DD-MM-YYYY HH:mm');
  const endDate = userDateRange[1].format ? userDateRange[1].format('DD-MM-YYYY HH:mm') : moment(userDateRange[1]).format('DD-MM-YYYY HH:mm');
  const startHour = operatingTimeRange[0].format ? operatingTimeRange[0].format('HH') : moment(operatingTimeRange[0]).format('HH');
  const endHour = operatingTimeRange[1].format ? operatingTimeRange[1].format('HH') : moment(operatingTimeRange[1]).format('HH');
  const requestUrl = `/api/v1/get_timed_device_readings/${deviceId}/${startDate}/${endDate}/${startHour}/${endHour}`;
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

export const updateUserProfile = (clientId, userId, updatedUserData, pendingLogo) => async (dispatch) => {
  dispatch(updateProfileLoading(true));
  try {
    const userUpdateResponse = await APIService.put(
      `/api/v2/clients/${clientId}/users/${userId}/`,
      updatedUserData
    );
    let updatedUser = userUpdateResponse.data;
    if (pendingLogo) {
      const formData = new FormData();
      formData.append('logo', pendingLogo, pendingLogo.name);
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      await APIService.putMultipart(
        `/api/v1/accounts/view-update-client/${clientId}/`,
        formData,
        config
      );
    }
    const clientResponse = await APIService.get(
      `/api/v1/accounts/view-update-client/${clientId}/`
    );
    const clientData = clientResponse.data.client;
    const completeUserData = {
      ...updatedUser,
      client_image: clientData.logo,
      client_type: clientData.client_type,
    };
    dispatch(updateProfileSuccess(completeUserData));
    dispatch(updateProfileLoading(false));
    return { fulfilled: true, message: 'Profile updated successfully!', data: completeUserData };
  } catch (error) {
    dispatch(updateProfileLoading(false));
    return { fulfilled: false, message: error.message || 'Failed to update profile.' };
  }
};

export const updateUserPassword = (updatePayload) => async (dispatch) => {
  dispatch(updatePasswordLoading(true));
  try {
    await APIService.post('/api/v1/account/user-password/', updatePayload);
    dispatch(updatePasswordSuccess(true));
    dispatch(updatePasswordLoading(false));
    return { fulfilled: true, message: 'Password updated successfully!' };
  } catch (error) {
    dispatch(updatePasswordLoading(false));
    let message = error?.response?.data?.detail || error?.response?.data?.message || error.message || 'Failed to update password.';
    return { fulfilled: false, message };
  }
};

export const resetPasswordAction = ({ email }) => async (dispatch) => {
  dispatch(resetPasswordLoading(true));
  try {
    const response = await APIServiceNoAuth.post('/api/v1/accounts/reset_password/', { email });
    dispatch(resetPasswordSuccess(response.data?.message));
    dispatch(resetPasswordLoading(false));
    return { fulfilled: true, message: response.data?.message || 'Check your email for reset instructions.' };
  } catch (error) {
    dispatch(resetPasswordLoading(false));
    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Request failed';
    return { fulfilled: false, message };
  }
};

export const confirmResetPasswordAction = ({ token, new_password }) => async (dispatch) => {
  dispatch(confirmResetPasswordLoading(true));
  try {
    const response = await APIServiceNoAuth.post('/api/v1/accounts/confirm_reset_password/', { token, new_password });
    dispatch(confirmResetPasswordSuccess(response.data?.message));
    dispatch(confirmResetPasswordLoading(false));
    return { fulfilled: true, message: response.data?.message || 'Password reset successfully.' };
  } catch (error) {
    dispatch(confirmResetPasswordLoading(false));
    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Request failed';
    return { fulfilled: false, message };
  }
};

export const validateResetTokenAction = (token) => async (dispatch) => {
  dispatch(validateResetTokenLoading(true));
  try {
    const response = await APIServiceNoAuth.get(
      `/api/v1/validate_reset_token/?token=${encodeURIComponent(token)}`
    );
    const { valid, reason } = response.data || {};
    dispatch(validateResetTokenSuccess({ valid: !!valid, reason: reason || null }));
    dispatch(validateResetTokenLoading(false));
    return { fulfilled: true, valid: !!valid, reason: reason || null };
  } catch (error) {
    dispatch(validateResetTokenSuccess({ valid: false, reason: 'error' }));
    dispatch(validateResetTokenLoading(false));
    return { fulfilled: false, valid: false, reason: error.response?.data?.reason || 'error' };
  }
};