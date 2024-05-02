import dieselTypes from "../../reducers/diesel/diesel.type";

export const getDieselLoading = (payload = true) => ({
    type: dieselTypes.GET_DIESEL_LOADING,
    payload,
});
export const getDieselSuccess = (payload = true) => ({
    type: dieselTypes.GET_DIESEL_SUCCESS,
    payload,
});