import overviewTypes from "./overview.type";

const initialState = {
    fetchTotalEnergyTopCardLoading: false,
    fetchedTotalEnergyTopCard: false,
    fetchCarbonEmissionTopCardLoading: false,
    fetchedCarbonEmissionTopCard: false
}

const overviewReducers = (state = initialState, action) => {
    switch (action.type) {
        case overviewTypes.GET_TOTAL_ENERGY_TOP_CARD_LOADING:
            return {
                ...state,
                fetchTotalEnergyTopCardLoading: action.payload
            }
        case overviewTypes.GET_TOTAL_ENERGY_TOP_CARD_SUCCESS:
            return {
                ...state,
                fetchedTotalEnergyTopCard: action.payload
            }

        case overviewTypes.GET_CARBON_EMISSION_TOP_CARD_LOADING:
            return {
                ...state,
                fetchCarbonEmissionTopCardLoading: action.payload
            }
        case overviewTypes.GET_CARBON_EMISSION_TOP_CARD_SUCCESS:
            return {
                ...state,
                fetchedCarbonEmissionTopCard: action.payload
            }
    
        default: return state;
    }
}

export default overviewReducers