import authTypes from "../../reducers/auth/auth.types";


export const loginUserLoading = (payload = true) => ({
  type: authTypes.LOGIN_USER_LOADING,
  payload,
});

export const loginUserSuccess = (payload = true) => ({
  type: authTypes.LOGIN_USER_SUCCESS,
  payload,
});


export const logoutUser = (payload = true) => ({
  type: authTypes.LOGOUT_USER,
  payload,
});


export const getRolesLoading = (payload = true) => ({
  type: authTypes.GET_ROLES_LOADING,
  payload,
});

export const getRolesSuccess = (payload = true) => ({
  type: authTypes.GET_ROLES_SUCCESS,
  payload,
});

export const getAllDevicesLoading = (payload = true) => ({
  type: authTypes.GET_ALL_DEVICES_LOADING,
  payload,
});

export const getAllDevicesSuccess = (payload = true) => ({
  type: authTypes.GET_ALL_DEVICES_SUCCESS,
  payload,
});

export const getDeviceReadingsLoading = (payload = true) => ({
  type: authTypes.GET_DEVICE_READINGS_LOADING,
  payload,
});

export const getDeviceReadingsSuccess = (payload = true) => ({
  type: authTypes.GET_DEVICE_READINGS_SUCCESS,
  payload,
});

export const addUsersLoading = (payload = true) => ({
  type: authTypes.ADD_USERS_LOADING,
  payload,
});

export const addUsersSuccess = (payload = true) => ({
  type: authTypes.ADD_USER_SUCCESS,
  payload,
});
export const addUserBranchLoading = (payload = true) => ({
  type: authTypes.ADD_USER_BRANCH_LOADING,
  payload,
});

export const addUserBranchSuccess = (payload = true) => ({
  type: authTypes.ADD_USER_BRANCH_SUCCESS,
  payload,
});

export const editUserLoading = (payload = true) => ({
  type: authTypes.EDIT_USER_LOADING,
  payload,
});

export const editUserSuccess = (payload = true) => ({
  type: authTypes.EDIT_USER_SUCCESS,
  payload,
});
