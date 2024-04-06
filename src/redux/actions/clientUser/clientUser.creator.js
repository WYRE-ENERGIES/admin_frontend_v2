import clientUserTypes from "../../reducers/clientUser/clientUser.type";

export const addClientUserLoading = (payload = true) => ({
    type: clientUserTypes.ADD_CLIENT_USER_LOADING,
    payload,
});
export const addClientUserSuccess = (payload = true) => ({
    type: clientUserTypes.ADD_CLIENT_USER_SUCCESS,
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