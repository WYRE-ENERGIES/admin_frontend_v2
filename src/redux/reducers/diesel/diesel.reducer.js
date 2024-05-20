import dieselTypes from "./diesel.type";

const initialState = {
    fetchDieselLoading: false,
    fetchedDiesel: false,
    fetchDieselProcurementLoading: false,
    fetchedDieselProcurement: false,
    fetchDieselConsumptionLoading: false,
    fetchedDieselConsumption: false,
}

const dieselReducers = (state = initialState, action) => {
    switch (action.type) { 
        case dieselTypes.GET_DIESEL_LOADING:
            return {
                ...state,
                fetchDieselLoading: action.payload
            }
        case dieselTypes.GET_DIESEL_SUCCESS:
            return {
                ...state,
                fetchedDiesel: action.payload
            }

        case dieselTypes.GET_DIESEL_PROCUREMENT_LOADING:
            return {
                ...state,
                fetchDieselProcurementLoading: action.payload
            }
        case dieselTypes.GET_DIESEL_PROCUREMENT_SUCCESS:
            return {
                ...state,
                fetchedDieselProcurement: action.payload
            }

        case dieselTypes.GET_DIESEL_CONSUMPTION_LOADING:
            return {
                ...state,
                fetchDieselConsumptionLoading: action.payload
            }
        case dieselTypes.GET_DIESEL_CONSUMPTION_SUCCESS:
            return {
                ...state,
                fetchedDieselConsumption: action.payload
            }
    
        default: return state;
    }
}

export default dieselReducers