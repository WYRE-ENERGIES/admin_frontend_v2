import locationTypes from "./location.type"

const initialState = {
    fetchLocationLoading: false,
    fetchedLocation: false,
}

const locationReducers = (state = initialState, action) => {
    switch (action.type) { 
        case locationTypes.GET_LOCATION_LOADING:
            return {
                ...state,
                fetchLocationLoading: action.payload
            }
        case locationTypes.GET_LOCATION_SUCCESS:
            return {
                ...state,
                fetchedLocation: action.payload
            }
    
        default: return state;
    }
}

export default locationReducers