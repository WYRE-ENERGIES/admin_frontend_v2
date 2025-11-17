import solarTypes from './solar.type';

const INITIAL_STATE = {
  stations: [],
  stationsLoading: false,
  stationsError: null,

  branches: [],
  branchesLoading: false,
  branchesError: null,

  searchedStation: null,
  searchedDevices: [],
  searchStationLoading: false,
  searchStationError: null,

  saveStationLoading: false,
  saveStationError: null,

  toggleStationStatusLoadingId: null,
  toggleStationStatusError: null,

  stationDetails: null,
  stationDevices: [],
  stationDetailsLoading: false,
  stationDetailsRefreshing: false,
  stationDetailsError: null,

  updateDeviceLoading: false,
  updateDeviceError: null,
};

const solarReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case solarTypes.FETCH_SOLAR_STATIONS_LOADING:
      return {
        ...state,
        stationsLoading: action.payload,
      };
    case solarTypes.FETCH_SOLAR_STATIONS_SUCCESS:
      return {
        ...state,
        stations: action.payload,
        stationsError: null,
      };
    case solarTypes.FETCH_SOLAR_STATIONS_FAILURE:
      return {
        ...state,
        stationsError: action.payload,
      };

    case solarTypes.FETCH_SOLAR_BRANCHES_LOADING:
      return {
        ...state,
        branchesLoading: action.payload,
      };
    case solarTypes.FETCH_SOLAR_BRANCHES_SUCCESS:
      return {
        ...state,
        branches: action.payload,
        branchesError: null,
      };
    case solarTypes.FETCH_SOLAR_BRANCHES_FAILURE:
      return {
        ...state,
        branchesError: action.payload,
      };

    case solarTypes.SEARCH_SOLAR_STATION_LOADING:
      return {
        ...state,
        searchStationLoading: action.payload,
      };
    case solarTypes.SEARCH_SOLAR_STATION_SUCCESS:
      return {
        ...state,
        searchedStation: action.payload.station,
        searchedDevices: action.payload.devices,
        searchStationError: null,
      };
    case solarTypes.SEARCH_SOLAR_STATION_NOT_FOUND:
      return {
        ...state,
        searchedStation: action.payload.station,
        searchedDevices: [],
        searchStationError: null,
      };
    case solarTypes.SEARCH_SOLAR_STATION_FAILURE:
      return {
        ...state,
        searchStationError: action.payload,
      };
    case solarTypes.CLEAR_SOLAR_STATION_SEARCH:
      return {
        ...state,
        searchedStation: null,
        searchedDevices: [],
        searchStationError: null,
      };

    case solarTypes.SAVE_SOLAR_STATION_LOADING:
      return {
        ...state,
        saveStationLoading: action.payload,
      };
    case solarTypes.SAVE_SOLAR_STATION_SUCCESS:
      return {
        ...state,
        saveStationError: null,
      };
    case solarTypes.SAVE_SOLAR_STATION_FAILURE:
      return {
        ...state,
        saveStationError: action.payload,
      };

    case solarTypes.TOGGLE_SOLAR_STATION_STATUS_LOADING:
      return {
        ...state,
        toggleStationStatusLoadingId: action.payload,
      };
    case solarTypes.TOGGLE_SOLAR_STATION_STATUS_SUCCESS: {
      const updatedStation = action.payload;
      return {
        ...state,
        stations: state.stations.map((station) => {
          const matchesId = station.id && updatedStation.id && String(station.id) === String(updatedStation.id);
          const matchesDeyeId =
            station.deye_station_id &&
            updatedStation.deye_station_id &&
            String(station.deye_station_id) === String(updatedStation.deye_station_id);
          const matchesBranch =
            station.branch_id &&
            updatedStation.branch_id &&
            String(station.branch_id) === String(updatedStation.branch_id);

          if (matchesId || matchesDeyeId || matchesBranch) {
            return { ...station, ...updatedStation };
          }

          return station;
        }),
        toggleStationStatusError: null,
        toggleStationStatusLoadingId: null,
      };
    }
    case solarTypes.TOGGLE_SOLAR_STATION_STATUS_FAILURE:
      return {
        ...state,
        toggleStationStatusError: action.payload,
        toggleStationStatusLoadingId: null,
      };

    case solarTypes.FETCH_SOLAR_STATION_DETAILS_LOADING:
      return {
        ...state,
        stationDetailsLoading: action.payload,
      };
    case solarTypes.FETCH_SOLAR_STATION_DETAILS_REFRESHING:
      return {
        ...state,
        stationDetailsRefreshing: action.payload,
      };
    case solarTypes.FETCH_SOLAR_STATION_DETAILS_SUCCESS:
      return {
        ...state,
        stationDetails: action.payload.details,
        stationDevices: action.payload.devices,
        stationDetailsError: null,
      };
    case solarTypes.FETCH_SOLAR_STATION_DETAILS_FAILURE:
      return {
        ...state,
        stationDetailsError: action.payload,
      };

    case solarTypes.UPDATE_SOLAR_DEVICE_LOADING:
      return {
        ...state,
        updateDeviceLoading: action.payload,
      };
    case solarTypes.UPDATE_SOLAR_DEVICE_SUCCESS: {
      const { id, updates } = action.payload;
      const hasDevice = state.stationDevices.some((device) => String(device.id) === String(id));
      const updatedDevices = hasDevice
        ? state.stationDevices.map((device) =>
            String(device.id) === String(id) ? { ...device, ...updates } : device
          )
        : [...state.stationDevices, { id, ...updates }];
      return {
        ...state,
        stationDevices: updatedDevices,
        updateDeviceError: null,
      };
    }
    case solarTypes.UPDATE_SOLAR_DEVICE_FAILURE:
      return {
        ...state,
        updateDeviceError: action.payload,
      };

    default:
      return state;
  }
};

export default solarReducer;

