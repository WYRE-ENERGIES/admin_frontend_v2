import clientUserTypes from "../../reducers/clientUser/clientUser.type";

export const getClientUserLoading = (payload = true) => ({
    type: clientUserTypes.GET_CLIENT_USER_LOADING,
    payload,
});
export const getClientUserSuccess = (payload = true) => ({
    type: clientUserTypes.GET_CLIENT_USER_SUCCESS,
    payload,
});