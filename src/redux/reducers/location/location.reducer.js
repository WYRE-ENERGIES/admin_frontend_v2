import { addLocationLoading } from "../../actions/location/location.creator"
import locationTypes from "./location.type"

const initialState = {
    fetchLocationLoading: false,
    fetchedLocation: false,

    newLocationLoading: false,
    newLocation: false,
    
    updateLocationLoading: false,
    updatedLocation: false,

    fetchRegionLoading: false,
    fetchedRegion: false,

    addNewRegionLoading: false,
    newRegion: false,
    
    updateRegionLoading: false,
    updatedRegion: false,

    removeRegionLoading: false,
    removedRegion: false,

    fetchClientRegionsLoading: false,
    fetchedClientRegions: [],
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

        case locationTypes.ADD_LOCATION_LOADING:
            return {
                ...state,
                addLocationLoading: action.payload
            }
        case locationTypes.ADD_LOCATION_SUCCESS:
            return {
                ...state,
                newLocation: action.payload
            }
            
        case locationTypes.EDIT_LOCATION_LOADING:
            return {
                ...state,
                updateLocationLoading: action.payload
            }
        case locationTypes.EDIT_LOCATION_SUCCESS:
            return {
                ...state,
                updatedLocation: action.payload
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

        case locationTypes.EDIT_REGION_LOADING:
            return {
                ...state,
                updateRegionLoading: action.payload
            }
        case locationTypes.EDIT_REGION_SUCCESS:
            return {
                ...state,
                updatedRegion: action.payload
            }

        case locationTypes.DELETE_REGION_LOADING:
            return {
                ...state,
                removeRegionLoading: action.payload
            }
        case locationTypes.DELETE_REGION_SUCCESS:
            return {
                ...state,
                removedRegion: action.payload
            }

        case locationTypes.GET_CLIENT_REGIONS_LOADING:
            return {
                ...state,
                fetchClientRegionsLoading: action.payload
            }
        case locationTypes.GET_CLIENT_REGIONS_SUCCESS:
            return {
                ...state,
                fetchedClientRegions: Array.isArray(action.payload) ? action.payload : []
            }
    
        default: return state;
    }
}

export default locationReducers