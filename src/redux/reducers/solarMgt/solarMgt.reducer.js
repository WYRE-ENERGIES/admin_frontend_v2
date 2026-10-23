import solarMgtTypes from './solarMgt.type';

const INITIAL_STATE = {
  realtimePower: null,
  realtimePowerLoading: false,
  realtimePowerError: null,

  dailyProduction: null,
  dailyProductionLoading: false,
  dailyProductionError: null,

  monthlyProduction: null,
  monthlyProductionLoading: false,
  monthlyProductionError: null,

  totalProduction: null,
  totalProductionLoading: false,
  totalProductionError: null,

  statusCounts: null,
  statusCountsLoading: false,
  statusCountsError: null,

  plants: [],
  plantsCount: 0,
  plantsPage: 1,
  plantsPageSize: 50,
  plantsLoading: false,
  plantsError: null,

  toggleFavouriteLoadingId: null,
  toggleFavouriteError: null,

  alarms: [],
  alarmsCount: 0,
  alarmsLoading: false,
  alarmsError: null,

  ackAlarmLoadingId: null,
  ackAlarmError: null,

  clients: [],
  clientsLoading: false,
  clientsError: null,
};

const solarMgtReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case solarMgtTypes.FETCH_REALTIME_POWER_LOADING:
      return { ...state, realtimePowerLoading: action.payload };
    case solarMgtTypes.FETCH_REALTIME_POWER_SUCCESS:
      return { ...state, realtimePower: action.payload, realtimePowerError: null };
    case solarMgtTypes.FETCH_REALTIME_POWER_FAILURE:
      return { ...state, realtimePowerError: action.payload };

    case solarMgtTypes.FETCH_DAILY_PRODUCTION_LOADING:
      return { ...state, dailyProductionLoading: action.payload };
    case solarMgtTypes.FETCH_DAILY_PRODUCTION_SUCCESS:
      return { ...state, dailyProduction: action.payload, dailyProductionError: null };
    case solarMgtTypes.FETCH_DAILY_PRODUCTION_FAILURE:
      return { ...state, dailyProductionError: action.payload };

    case solarMgtTypes.FETCH_MONTHLY_PRODUCTION_LOADING:
      return { ...state, monthlyProductionLoading: action.payload };
    case solarMgtTypes.FETCH_MONTHLY_PRODUCTION_SUCCESS:
      return { ...state, monthlyProduction: action.payload, monthlyProductionError: null };
    case solarMgtTypes.FETCH_MONTHLY_PRODUCTION_FAILURE:
      return { ...state, monthlyProductionError: action.payload };

    case solarMgtTypes.FETCH_TOTAL_PRODUCTION_LOADING:
      return { ...state, totalProductionLoading: action.payload };
    case solarMgtTypes.FETCH_TOTAL_PRODUCTION_SUCCESS:
      return { ...state, totalProduction: action.payload, totalProductionError: null };
    case solarMgtTypes.FETCH_TOTAL_PRODUCTION_FAILURE:
      return { ...state, totalProductionError: action.payload };

    case solarMgtTypes.FETCH_STATUS_COUNTS_LOADING:
      return { ...state, statusCountsLoading: action.payload };
    case solarMgtTypes.FETCH_STATUS_COUNTS_SUCCESS:
      return { ...state, statusCounts: action.payload, statusCountsError: null };
    case solarMgtTypes.FETCH_STATUS_COUNTS_FAILURE:
      return { ...state, statusCountsError: action.payload };

    case solarMgtTypes.FETCH_SOLAR_PLANTS_LOADING:
      return { ...state, plantsLoading: action.payload };
    case solarMgtTypes.FETCH_SOLAR_PLANTS_SUCCESS:
      return {
        ...state,
        plants: action.payload.results,
        plantsCount: action.payload.count,
        plantsPage: action.payload.page,
        plantsPageSize: action.payload.page_size,
        plantsError: null,
      };
    case solarMgtTypes.FETCH_SOLAR_PLANTS_FAILURE:
      return { ...state, plantsError: action.payload };

    case solarMgtTypes.TOGGLE_FAVOURITE_LOADING:
      return { ...state, toggleFavouriteLoadingId: action.payload };
    case solarMgtTypes.TOGGLE_FAVOURITE_SUCCESS: {
      const { plantId, is_favourited } = action.payload || {};
      return {
        ...state,
        plants: state.plants.map((plant) =>
          String(plant.id) === String(plantId)
            ? { ...plant, is_favourited }
            : plant
        ),
        toggleFavouriteError: null,
      };
    }
    case solarMgtTypes.TOGGLE_FAVOURITE_FAILURE:
      return {
        ...state,
        toggleFavouriteError: action.payload?.message ?? action.payload ?? null,
      };

    case solarMgtTypes.FETCH_ALARMS_LOADING:
      return { ...state, alarmsLoading: action.payload };
    case solarMgtTypes.FETCH_ALARMS_SUCCESS:
      return {
        ...state,
        alarms: action.payload.results,
        alarmsCount: action.payload.count,
        alarmsError: null,
      };
    case solarMgtTypes.FETCH_ALARMS_FAILURE:
      return { ...state, alarmsError: action.payload };

    case solarMgtTypes.ACK_ALARM_LOADING:
      return { ...state, ackAlarmLoadingId: action.payload };
    case solarMgtTypes.ACK_ALARM_SUCCESS: {
      const { alarmId, data } = action.payload || {};
      return {
        ...state,
        alarms: state.alarms.map((alarm) =>
          String(alarm.id) === String(alarmId)
            ? {
                ...alarm,
                is_acknowledged: data?.is_acknowledged ?? true,
                acked_at: data?.acked_at ?? new Date().toISOString(),
                ack_note: data?.ack_note ?? alarm.ack_note,
              }
            : alarm
        ),
        ackAlarmError: null,
      };
    }
    case solarMgtTypes.ACK_ALARM_FAILURE:
      return {
        ...state,
        ackAlarmError: action.payload?.message ?? action.payload ?? null,
      };

    case solarMgtTypes.FETCH_SOLAR_CLIENTS_LOADING:
      return { ...state, clientsLoading: action.payload };
    case solarMgtTypes.FETCH_SOLAR_CLIENTS_SUCCESS:
      return { ...state, clients: action.payload, clientsError: null };
    case solarMgtTypes.FETCH_SOLAR_CLIENTS_FAILURE:
      return { ...state, clientsError: action.payload };

    default:
      return state;
  }
};

export default solarMgtReducer;
