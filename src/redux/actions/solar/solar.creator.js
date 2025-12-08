import solarTypes from '../../reducers/solar/solar.type';

export const fetchSolarStationsLoading = (payload = true) => ({
  type: solarTypes.FETCH_SOLAR_STATIONS_LOADING,
  payload,
});

export const fetchSolarStationsSuccess = (payload = []) => ({
  type: solarTypes.FETCH_SOLAR_STATIONS_SUCCESS,
  payload,
});

export const fetchSolarStationsFailure = (payload) => ({
  type: solarTypes.FETCH_SOLAR_STATIONS_FAILURE,
  payload,
});

export const fetchSolarBranchesLoading = (payload = true) => ({
  type: solarTypes.FETCH_SOLAR_BRANCHES_LOADING,
  payload,
});

export const fetchSolarBranchesSuccess = (payload = []) => ({
  type: solarTypes.FETCH_SOLAR_BRANCHES_SUCCESS,
  payload,
});

export const fetchSolarBranchesFailure = (payload) => ({
  type: solarTypes.FETCH_SOLAR_BRANCHES_FAILURE,
  payload,
});

export const searchSolarStationLoading = (payload = true) => ({
  type: solarTypes.SEARCH_SOLAR_STATION_LOADING,
  payload,
});

export const searchSolarStationSuccess = (payload) => ({
  type: solarTypes.SEARCH_SOLAR_STATION_SUCCESS,
  payload,
});

export const searchSolarStationNotFound = (payload) => ({
  type: solarTypes.SEARCH_SOLAR_STATION_NOT_FOUND,
  payload,
});

export const searchSolarStationFailure = (payload) => ({
  type: solarTypes.SEARCH_SOLAR_STATION_FAILURE,
  payload,
});

export const clearSolarStationSearch = () => ({
  type: solarTypes.CLEAR_SOLAR_STATION_SEARCH,
});

export const saveSolarStationLoading = (payload = true) => ({
  type: solarTypes.SAVE_SOLAR_STATION_LOADING,
  payload,
});

export const saveSolarStationSuccess = (payload) => ({
  type: solarTypes.SAVE_SOLAR_STATION_SUCCESS,
  payload,
});

export const saveSolarStationFailure = (payload) => ({
  type: solarTypes.SAVE_SOLAR_STATION_FAILURE,
  payload,
});

export const toggleSolarStationStatusLoading = (payload) => ({
  type: solarTypes.TOGGLE_SOLAR_STATION_STATUS_LOADING,
  payload,
});

export const toggleSolarStationStatusSuccess = (payload) => ({
  type: solarTypes.TOGGLE_SOLAR_STATION_STATUS_SUCCESS,
  payload,
});

export const toggleSolarStationStatusFailure = (payload) => ({
  type: solarTypes.TOGGLE_SOLAR_STATION_STATUS_FAILURE,
  payload,
});

export const fetchSolarStationDetailsLoading = (payload = true) => ({
  type: solarTypes.FETCH_SOLAR_STATION_DETAILS_LOADING,
  payload,
});

export const fetchSolarStationDetailsRefreshing = (payload = true) => ({
  type: solarTypes.FETCH_SOLAR_STATION_DETAILS_REFRESHING,
  payload,
});

export const fetchSolarStationDetailsSuccess = (payload) => ({
  type: solarTypes.FETCH_SOLAR_STATION_DETAILS_SUCCESS,
  payload,
});

export const fetchSolarStationDetailsFailure = (payload) => ({
  type: solarTypes.FETCH_SOLAR_STATION_DETAILS_FAILURE,
  payload,
});

export const updateSolarDeviceLoading = (payload = true) => ({
  type: solarTypes.UPDATE_SOLAR_DEVICE_LOADING,
  payload,
});

export const updateSolarDeviceSuccess = (payload) => ({
  type: solarTypes.UPDATE_SOLAR_DEVICE_SUCCESS,
  payload,
});

export const updateSolarDeviceFailure = (payload) => ({
  type: solarTypes.UPDATE_SOLAR_DEVICE_FAILURE,
  payload,
});

