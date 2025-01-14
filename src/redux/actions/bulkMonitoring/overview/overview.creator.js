import overviewTypes from "../../../reducers/bulkMonitoring/overview/overview.type";

export const getAllTimeEnergyConsumptionLoading = (payload = true) => ({
    type: overviewTypes.GET_ALL_TIME_ENERGY_CONSUMPTION_LOADING,
    payload,
});  
export const getAllTimeEnergyConsumptionSuccess = (payload = true) => ({
    type: overviewTypes.GET_ALL_TIME_energy_CONSUMPTION_SUCCESS,
    payload,
});

export const getThisMonthEnergyConsumptionLoading = (payload = true) => ({
    type: overviewTypes.GET_THIS_MONTH_ENERGY_CONSUMPTION_LOADING,
    payload,
});
export const getThisMonthEnergyConsumptionSuccess = (payload = true) => ({
    type: overviewTypes.GET_THIS_MONTH_energy_CONSUMPTION_SUCCESS,
    payload,
});

export const getLastMonthEnergyConsumptionLoading = (payload = true) => ({
    type: overviewTypes.GET_LAST_MONTH_ENERGY_CONSUMPTION_LOADING,
    payload,
});
export const getLastMonthEnergyConsumptionSuccess = (payload = true) => ({
    type: overviewTypes.GET_LAST_MONTH_ENERGY_CONSUMPTION_SUCCESS,
    payload,
});

export const getAmountLoading = (payload = true) => ({
    type: overviewTypes.GET_AMOUNT_LOADING,
    payload,
});
export const getAmountSuccess = (payload = true) => ({
    type: overviewTypes.GET_AMOUNT_SUCCESS,
    payload,
});

export const getDevicesListLoading = (payload = true) => ({
    type: overviewTypes.GET_DEVICES_LIST_LOADING,
    payload,
});
export const getDevicesListSuccess = (payload = true) => ({
    type: overviewTypes.GET_DEVICES_LIST_SUCCESS,
    payload,
});