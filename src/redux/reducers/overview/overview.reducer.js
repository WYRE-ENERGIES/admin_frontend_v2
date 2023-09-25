import overviewTypes from "./overview.type";

const initialState = {
    fetchTotalEnergyTopCardLoading: false,
    fetchedTotalEnergyTopCard: false,
    fetchTotalEnergyBarChartLoading: false,
    fetchedTotalEnergyBarChart: false
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

        case overviewTypes.GET_TOTAL_ENERGY_BARCHART_LOADING:
            return {
                ...state,
                fetchTotalEnergyBarChartLoading: action.payload
            }
        case overviewTypes.GET_TOTAL_ENERGY_BARCHART_SUCCESS:
            return {
                ...state,
                fetchedTotalEnergyBarChart: action.payload
            }
    
        default: return state;
    }
}

export default overviewReducers