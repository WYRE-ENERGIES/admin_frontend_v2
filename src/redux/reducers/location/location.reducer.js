import locationTypes from "./location.type"

const initialState = {
    fetchLocationLoading: false,
    fetchedLocation: false,

    fetchRegionLoading: false,
    fetchedRegion: false,

    addNewRegionLoading: false,
    newRegion: false,
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

        case locationTypes.GET_REGION_LOADING:
            return {
                ...state,
                fetchRegionLoading: action.payload
            }
        case locationTypes.GET_REGION_SUCCESS:
            return {
                ...state,
                fetchedRegion: action.payload
            }

        case locationTypes.ADD_REGION_LOADING:
            return {
                ...state,
                addNewRegionLoading: action.payload
            }
        case locationTypes.ADD_REGION_SUCCESS:
            return {
                ...state,
                newRegion: action.payload
            }
    
        default: return state;
    }
}

export default locationReducers