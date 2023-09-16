import overviewTypes from "../../reducers/overview/overview.type";

export const getTotalEnergyTopCardLoading = (payload = true) => ({
    type: overviewTypes.GET_TOTAL_ENERGY_TOP_CARD_LOADING,
    payload,
});  
export const getTotalEnergyTopCardSuccess = (payload = true) => ({
    type: overviewTypes.GET_TOTAL_ENERGY_TOP_CARD_SUCCESS,
    payload,
});

export const getCarbonEmissionTopCard = (payload = true) => ({
    type: overviewTypes.GET_CARBON_EMISSION_TOP_CARD_LOADING,
    payload,
});
export const getCarbonEmmissionTopCard = (payload = true) => ({
    type: overviewTypes.GET_CARBON_EMISSION_TOP_CARD_SUCCESS,
    payload,
});