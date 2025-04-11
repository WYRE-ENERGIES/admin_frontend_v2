import clientUserTypes from "../../reducers/clientUser/clientUser.type";

export const addClientUserLoading = (payload = true) => ({
    type: clientUserTypes.ADD_CLIENT_USER_LOADING,
    payload,
});
export const addClientUserSuccess = (payload = true) => ({
    type: clientUserTypes.ADD_CLIENT_USER_SUCCESS,
    payload,
});

export const addUserBranchLoading = (payload = true) => ({
    type: clientUserTypes.ADD_USER_BRANCH_LOADING,
    payload,
});
export const addUserBranchSuccess = (payload = true) => ({
    type: clientUserTypes.ADD_USER_BRANCH_SUCCESS,
    payload,
});

export const getClientUserLoading = (payload = true) => ({
    type: clientUserTypes.GET_CLIENT_USER_LOADING,
    payload,
});
export const getClientUserSuccess = (payload = true) => ({
    type: clientUserTypes.GET_CLIENT_USER_SUCCESS,
    payload,
});

export const getViewUserBranchesLoading = (payload = true) => ({
    type: clientUserTypes.GET_VIEW_USER_BRANCHES_LOADING,
    payload,
});
export const getViewUserBranchesSuccess = (payload = true) => ({
    type: clientUserTypes.GET_VIEW_USER_BRANCHES_SUCCESS,
    payload,
});

export const getUserBranchLoading = (payload = true) => ({
    type: clientUserTypes.GET_USER_BRANCH_LOADING,
    payload,
});
export const getUserBranchSuccess = (payload = true) => ({
    type: clientUserTypes.GET_USER_BRANCH_SUCCESS,
    payload,
});

export const editClientUserLoading = (payload = true) => ({
    type: clientUserTypes.EDIT_CLIENT_USER_LOADING,
    payload,
});
export const editClientUserSuccess = (payload = true) => ({
    type: clientUserTypes.EDIT_CLIENT_USER_SUCCESS,
    payload,
});

export const deleteClientUserLoading = (payload = true) => ({
    type: clientUserTypes.DELETE_CLIENT_USER_LOADING,
    payload,
});
export const deleteClientUserSuccess = (payload = true) => ({
    type: clientUserTypes.DELETE_CLIENT_USER_SUCCESS,
    payload,
});