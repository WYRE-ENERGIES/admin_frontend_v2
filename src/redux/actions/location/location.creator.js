import locationTypes from "../../reducers/location/location.type";

export const getLocationLoading = (payload = true) => ({
    type: locationTypes.GET_LOCATION_LOADING,
    payload,
});
export const getLocationSuccess = (payload = true) => ({
    type: locationTypes.GET_LOCATION_SUCCESS,
    payload,
});

export const editLocationLoading = (payload = true) => ({
    type: locationTypes.EDIT_LOCATION_LOADING,
    payload,
});
export const editLocationSuccess = (payload = true) => ({
    type: locationTypes.EDIT_LOCATION_SUCCESS,
    payload,
});

export const getRegionLoading = (payload = true) => ({
    type: locationTypes.GET_REGION_LOADING,
    payload,
});
export const getRegionSuccess = (payload = true) => ({
    type: locationTypes.GET_REGION_SUCCESS,
    payload,
});

export const addRegionLoading = (payload = true) => ({
    type: locationTypes.ADD_REGION_LOADING,
    payload,
});
export const addRegionSuccess = (payload = true) => ({
    type: locationTypes.ADD_REGION_SUCCESS,
    payload,
});

export const editRegionLoading = (payload = true) => ({
    type: locationTypes.EDIT_REGION_LOADING,
    payload,
});
export const editRegionSuccess = (payload = true) => ({
    type: locationTypes.EDIT_REGION_SUCCESS,
    payload,
});