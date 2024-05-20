import dieselTypes from "../../reducers/diesel/diesel.type";

export const getDieselLoading = (payload = true) => ({
    type: dieselTypes.GET_DIESEL_LOADING,
    payload,
});
export const getDieselSuccess = (payload = true) => ({
    type: dieselTypes.GET_DIESEL_SUCCESS,
    payload,
});

export const getDieselProcurementLoading = (payload = true) => ({
    type: dieselTypes.GET_DIESEL_PROCUREMENT_LOADING,
    payload,
});
export const getDieselProcurementSuccess = (payload = true) => ({
    type: dieselTypes.GET_DIESEL_PROCUREMENT_SUCCESS,
    payload,
});

export const getDieselConsumptionLoading = (payload = true) => ({
    type: dieselTypes.GET_DIESEL_CONSUMPTION_LOADING,
    payload,
});
export const getDieselConsumptionSuccess = (payload = true) => ({
    type: dieselTypes.GET_DIESEL_CONSUMPTION_SUCCESS,
    payload,
});