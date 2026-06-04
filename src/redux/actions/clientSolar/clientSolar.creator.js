import clientSolarTypes from '../../reducers/clientSolar/clientSolar.type';

export const fetchGeneratingNowLoading = (payload = true) => ({
  type: clientSolarTypes.FETCH_CS_GENERATING_NOW_LOADING,
  payload,
});
export const fetchGeneratingNowSuccess = (payload) => ({
  type: clientSolarTypes.FETCH_CS_GENERATING_NOW_SUCCESS,
  payload,
});
export const fetchGeneratingNowFailure = (payload) => ({
  type: clientSolarTypes.FETCH_CS_GENERATING_NOW_FAILURE,
  payload,
});

export const fetchTodayLoading = (payload = true) => ({
  type: clientSolarTypes.FETCH_CS_TODAY_LOADING,
  payload,
});
export const fetchTodaySuccess = (payload) => ({
  type: clientSolarTypes.FETCH_CS_TODAY_SUCCESS,
  payload,
});
export const fetchTodayFailure = (payload) => ({
  type: clientSolarTypes.FETCH_CS_TODAY_FAILURE,
  payload,
});

export const fetchThisMonthLoading = (payload = true) => ({
  type: clientSolarTypes.FETCH_CS_THIS_MONTH_LOADING,
  payload,
});
export const fetchThisMonthSuccess = (payload) => ({
  type: clientSolarTypes.FETCH_CS_THIS_MONTH_SUCCESS,
  payload,
});
export const fetchThisMonthFailure = (payload) => ({
  type: clientSolarTypes.FETCH_CS_THIS_MONTH_FAILURE,
  payload,
});

export const fetchLifetimeLoading = (payload = true) => ({
  type: clientSolarTypes.FETCH_CS_LIFETIME_LOADING,
  payload,
});
export const fetchLifetimeSuccess = (payload) => ({
  type: clientSolarTypes.FETCH_CS_LIFETIME_SUCCESS,
  payload,
});
export const fetchLifetimeFailure = (payload) => ({
  type: clientSolarTypes.FETCH_CS_LIFETIME_FAILURE,
  payload,
});

export const fetchCsStatusCountsLoading = (payload = true) => ({
  type: clientSolarTypes.FETCH_CS_STATUS_COUNTS_LOADING,
  payload,
});
export const fetchCsStatusCountsSuccess = (payload) => ({
  type: clientSolarTypes.FETCH_CS_STATUS_COUNTS_SUCCESS,
  payload,
});
export const fetchCsStatusCountsFailure = (payload) => ({
  type: clientSolarTypes.FETCH_CS_STATUS_COUNTS_FAILURE,
  payload,
});

export const fetchCsBranchesLoading = (payload = true) => ({
  type: clientSolarTypes.FETCH_CS_BRANCHES_LOADING,
  payload,
});
export const fetchCsBranchesSuccess = (payload) => ({
  type: clientSolarTypes.FETCH_CS_BRANCHES_SUCCESS,
  payload,
});
export const fetchCsBranchesFailure = (payload) => ({
  type: clientSolarTypes.FETCH_CS_BRANCHES_FAILURE,
  payload,
});

export const fetchCsBranchTrendLoading = (payload = true) => ({
  type: clientSolarTypes.FETCH_CS_BRANCH_TREND_LOADING,
  payload,
});
export const fetchCsBranchTrendSuccess = (payload) => ({
  type: clientSolarTypes.FETCH_CS_BRANCH_TREND_SUCCESS,
  payload,
});
export const fetchCsBranchTrendFailure = (payload) => ({
  type: clientSolarTypes.FETCH_CS_BRANCH_TREND_FAILURE,
  payload,
});

export const toggleCsFavouriteLoading = (payload = true) => ({
  type: clientSolarTypes.TOGGLE_CS_FAVOURITE_LOADING,
  payload,
});
export const toggleCsFavouriteSuccess = (payload) => ({
  type: clientSolarTypes.TOGGLE_CS_FAVOURITE_SUCCESS,
  payload,
});
export const toggleCsFavouriteFailure = (payload) => ({
  type: clientSolarTypes.TOGGLE_CS_FAVOURITE_FAILURE,
  payload,
});

export const fetchCsAlarmsLoading = (payload = true) => ({
  type: clientSolarTypes.FETCH_CS_ALARMS_LOADING,
  payload,
});
export const fetchCsAlarmsSuccess = (payload) => ({
  type: clientSolarTypes.FETCH_CS_ALARMS_SUCCESS,
  payload,
});
export const fetchCsAlarmsFailure = (payload) => ({
  type: clientSolarTypes.FETCH_CS_ALARMS_FAILURE,
  payload,
});

export const ackCsAlarmLoading = (payload = true) => ({
  type: clientSolarTypes.ACK_CS_ALARM_LOADING,
  payload,
});
export const ackCsAlarmSuccess = (payload) => ({
  type: clientSolarTypes.ACK_CS_ALARM_SUCCESS,
  payload,
});
export const ackCsAlarmFailure = (payload) => ({
  type: clientSolarTypes.ACK_CS_ALARM_FAILURE,
  payload,
});

export const csForceLoginLoading = (payload = true) => ({
  type: clientSolarTypes.CS_FORCE_LOGIN_LOADING,
  payload,
});
export const csForceLoginSuccess = (payload) => ({
  type: clientSolarTypes.CS_FORCE_LOGIN_SUCCESS,
  payload,
});
export const csForceLoginFailure = (payload) => ({
  type: clientSolarTypes.CS_FORCE_LOGIN_FAILURE,
  payload,
});
