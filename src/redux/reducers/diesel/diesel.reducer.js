import dieselTypes from "./diesel.type";

const initialState = {
    fetchDieselLoading: false,
    fetchedDiesel: false,
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
    
        default: return state;
    }
}

export default dieselReducers