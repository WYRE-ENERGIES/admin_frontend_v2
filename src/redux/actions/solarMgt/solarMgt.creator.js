import solarMgtTypes from '../../reducers/solarMgt/solarMgt.type';

export const fetchRealtimePowerLoading = (payload = true) => ({
  type: solarMgtTypes.FETCH_REALTIME_POWER_LOADING,
  payload,
});

export const fetchRealtimePowerSuccess = (payload) => ({
  type: solarMgtTypes.FETCH_REALTIME_POWER_SUCCESS,
  payload,
});

export const fetchRealtimePowerFailure = (payload) => ({
  type: solarMgtTypes.FETCH_REALTIME_POWER_FAILURE,
  payload,
});

export const fetchDailyProductionLoading = (payload = true) => ({
  type: solarMgtTypes.FETCH_DAILY_PRODUCTION_LOADING,
  payload,
});

export const fetchDailyProductionSuccess = (payload) => ({
  type: solarMgtTypes.FETCH_DAILY_PRODUCTION_SUCCESS,
  payload,
});

export const fetchDailyProductionFailure = (payload) => ({
  type: solarMgtTypes.FETCH_DAILY_PRODUCTION_FAILURE,
  payload,
});

export const fetchMonthlyProductionLoading = (payload = true) => ({
  type: solarMgtTypes.FETCH_MONTHLY_PRODUCTION_LOADING,
  payload,
});

export const fetchMonthlyProductionSuccess = (payload) => ({
  type: solarMgtTypes.FETCH_MONTHLY_PRODUCTION_SUCCESS,
  payload,
});

export const fetchMonthlyProductionFailure = (payload) => ({
  type: solarMgtTypes.FETCH_MONTHLY_PRODUCTION_FAILURE,
  payload,
});

export const fetchTotalProductionLoading = (payload = true) => ({
  type: solarMgtTypes.FETCH_TOTAL_PRODUCTION_LOADING,
  payload,
});

export const fetchTotalProductionSuccess = (payload) => ({
  type: solarMgtTypes.FETCH_TOTAL_PRODUCTION_SUCCESS,
  payload,
});

export const fetchTotalProductionFailure = (payload) => ({
  type: solarMgtTypes.FETCH_TOTAL_PRODUCTION_FAILURE,
  payload,
});

export const fetchStatusCountsLoading = (payload = true) => ({
  type: solarMgtTypes.FETCH_STATUS_COUNTS_LOADING,
  payload,
});

export const fetchStatusCountsSuccess = (payload) => ({
  type: solarMgtTypes.FETCH_STATUS_COUNTS_SUCCESS,
  payload,
});

export const fetchStatusCountsFailure = (payload) => ({
  type: solarMgtTypes.FETCH_STATUS_COUNTS_FAILURE,
  payload,
});

export const fetchSolarPlantsLoading = (payload = true) => ({
  type: solarMgtTypes.FETCH_SOLAR_PLANTS_LOADING,
  payload,
});

export const fetchSolarPlantsSuccess = (payload) => ({
  type: solarMgtTypes.FETCH_SOLAR_PLANTS_SUCCESS,
  payload,
});

export const fetchSolarPlantsFailure = (payload) => ({
  type: solarMgtTypes.FETCH_SOLAR_PLANTS_FAILURE,
  payload,
});

export const toggleFavouriteLoading = (payload) => ({
  type: solarMgtTypes.TOGGLE_FAVOURITE_LOADING,
  payload,
});

export const toggleFavouriteSuccess = (payload) => ({
  type: solarMgtTypes.TOGGLE_FAVOURITE_SUCCESS,
  payload,
});

export const toggleFavouriteFailure = (payload) => ({
  type: solarMgtTypes.TOGGLE_FAVOURITE_FAILURE,
  payload,
});

export const fetchAlarmsLoading = (payload = true) => ({
  type: solarMgtTypes.FETCH_ALARMS_LOADING,
  payload,
});

export const fetchAlarmsSuccess = (payload) => ({
  type: solarMgtTypes.FETCH_ALARMS_SUCCESS,
  payload,
});

export const fetchAlarmsFailure = (payload) => ({
  type: solarMgtTypes.FETCH_ALARMS_FAILURE,
  payload,
});

export const ackAlarmLoading = (payload) => ({
  type: solarMgtTypes.ACK_ALARM_LOADING,
  payload,
});

export const ackAlarmSuccess = (payload) => ({
  type: solarMgtTypes.ACK_ALARM_SUCCESS,
  payload,
});

export const ackAlarmFailure = (payload) => ({
  type: solarMgtTypes.ACK_ALARM_FAILURE,
  payload,
});

export const fetchSolarClientsLoading = (payload = true) => ({
  type: solarMgtTypes.FETCH_SOLAR_CLIENTS_LOADING,
  payload,
});

export const fetchSolarClientsSuccess = (payload) => ({
  type: solarMgtTypes.FETCH_SOLAR_CLIENTS_SUCCESS,
  payload,
});

export const fetchSolarClientsFailure = (payload) => ({
  type: solarMgtTypes.FETCH_SOLAR_CLIENTS_FAILURE,
  payload,
});
