import locationTypes from "../../reducers/location/location.type";

export const getLocationLoading = (payload = true) => ({
    type: locationTypes.GET_LOCATION_LOADING,
    payload,
});
export const getLocationSuccess = (payload = true) => ({
    type: locationTypes.GET_LOCATION_SUCCESS,
    payload,
});