import overviewTypes from "../../reducers/overview/overview.type";

export const getTotalEnergyTopCardLoading = (payload = true) => ({
    type: overviewTypes.GET_TOTAL_ENERGY_TOP_CARD_LOADING,
    payload,
});  
export const getTotalEnergyTopCardSuccess = (payload = true) => ({
    type: overviewTypes.GET_TOTAL_ENERGY_TOP_CARD_SUCCESS,
    payload,
});

export const getTotalEnergyBarChartLoading = (payload = true) => ({
    type: overviewTypes.GET_TOTAL_ENERGY_BARCHART_LOADING,
    payload,
});
export const gettTotalEnergyBarChartSuccess = (payload = true) => ({
    type: overviewTypes.GET_TOTAL_ENERGY_BARCHART_SUCCESS,
    payload,
});

export const getTotalCostBarChartLoading = (payload = true) => ({
    type: overviewTypes.GET_TOTAL_COST_BARCHART_LOADING,
    payload,
});
export const getTotalCostBarChartSuccess = (payload = true) => ({
    type: overviewTypes.GET_TOTAL_COST_BARCHART_SUCCESS,
    payload,
});

export const getUtilityEnergyBarChartLoading = (payload = true) => ({
    type: overviewTypes.GET_UTILITY_ENERGY_LOADING,
    payload,
});
export const getUtilityEnergyBarChartSuccess = (payload = true) => ({
    type: overviewTypes.GET_UTILITY_ENERGY_SUCCESS,
    payload,
});

export const getDieselCostBarChartLoading = (payload = true) => ({
    type: overviewTypes.GET_DIESEL_COST_LOADING,
    payload,
});
export const getDieselCostBarChartSuccess = (payload = true) => ({
    type: overviewTypes.GET_DIESEL_COST_SUCCESS,
    payload,
});

export const getDieselLitresBarChartLoading = (payload = true) => ({
    type: overviewTypes.GET_DIESEL_LITRES_LOADING,
    payload,
});
export const getDieselLitresBarChartSuccess = (payload = true) => ({
    type: overviewTypes.GET_DIESEL_LITRES_SUCCESS,
    payload,
});

export const getKeyMetricsLoading = (payload = true) => ({
    type: overviewTypes.GET_KEY_METRICS_LOADING,
    payload,
});
export const getKeyMetricsSuccess = (payload = true) => ({
    type: overviewTypes.GET_KEY_METRICS_SUCCESS,
    payload,
});