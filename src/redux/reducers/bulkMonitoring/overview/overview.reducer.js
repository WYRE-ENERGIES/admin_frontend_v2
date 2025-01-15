import overviewTypes from "./overview.type";

const initialState = {
    fetchAllTimeEnergyConsumptionLoading: false,
    fetchedAllTimeEnergyConsumption: false,
    fetchLastMonthEnergyConsumptionLoading: false,
    fetchedLastMonthEnergyConsumption: false,
    fetchThisMonthEnergyConsumptionLoading: false,
    fetchedThisMonthEnergyConsumption: false,
    fetchAmountLoading: false,
    fetchedAmount: false,
    fetchDevicesListLoading: false,
    fetchedDevicesList: false,
}

const overviewReducersBulkMonitoring = (state = initialState, action) => {
    switch (action.type) {
        case overviewTypes.GET_ALL_TIME_ENERGY_CONSUMPTION_LOADING:
            return {
                ...state,
                fetchAllTimeEnergyConsumptionLoading: action.payload
            }
        case overviewTypes.GET_ALL_TIME_energy_CONSUMPTION_SUCCESS:
            return {
                ...state,
                fetchedAllTimeEnergyConsumption: action.payload
            }

        case overviewTypes.GET_LAST_MONTH_ENERGY_CONSUMPTION_LOADING:
            return {
                ...state,
                fetchLastMonthEnergyConsumptionLoading: action.payload
            }
        case overviewTypes.GET_LAST_MONTH_ENERGY_CONSUMPTION_SUCCESS:
            return {
                ...state,
                fetchedLastMonthEnergyConsumption: action.payload
            }

        case overviewTypes.GET_THIS_MONTH_ENERGY_CONSUMPTION_LOADING:
            return {
                ...state,
                fetchThisMonthEnergyConsumptionLoading: action.payload
            }
        case overviewTypes.GET_THIS_MONTH_energy_CONSUMPTION_SUCCESS:
            return {
                ...state,
                fetchedThisMonthEnergyConsumption: action.payload
            }

        case overviewTypes.GET_AMOUNT_LOADING:
            return {
                ...state,
                fetchAmountLoading: action.payload
            }
        case overviewTypes.GET_AMOUNT_SUCCESS:
            return {
                ...state,
                fetchedAmount: action.payload
            }

        case overviewTypes.GET_DEVICES_LIST_LOADING:
            return {
                ...state,
                fetchDevicesListLoading: action.payload
            }
        case overviewTypes.GET_DEVICES_LIST_SUCCESS:
            return {
                ...state,
                fetchedDevicesList: action.payload
            }
    
        default: return state;
    }
}

export default overviewReducersBulkMonitoring