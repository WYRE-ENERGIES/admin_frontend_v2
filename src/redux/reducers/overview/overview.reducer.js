import overviewTypes from "./overview.type";

const initialState = {
    fetchTotalEnergyTopCardLoading: false,
    fetchedTotalEnergyTopCard: false,
    fetchTotalEnergyBarChartLoading: false,
    fetchedTotalEnergyBarChart: false,
    fetchTotalCostBarChartLoading: false,
    fetchedTotalCostBarChart: false,
    fetchKeyMetricsLoading: false,
    fetchedKeyMetrics: false
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

        case overviewTypes.GET_TOTAL_COST_BARCHART_LOADING:
            return {
                ...state,
                fetchTotalCostBarChartLoading: action.payload
            }
        case overviewTypes.GET_TOTAL_COST_BARCHART_SUCCESS:
            return {
                ...state,
                fetchedTotalCostBarChart: action.payload
            }
            
        case overviewTypes.GET_KEY_METRICS_LOADING:
            return {
                ...state,
                fetchKeyMetricsLoading: action.payload
            }
        case overviewTypes.GET_KEY_METRICS_SUCCESS:
            return {
                ...state,
                fetchedKeyMetrics: action.payload
            }
    
        default: return state;
    }
}

export default overviewReducers