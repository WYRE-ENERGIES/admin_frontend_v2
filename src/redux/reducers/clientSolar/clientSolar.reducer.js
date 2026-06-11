import clientSolarTypes from './clientSolar.type';

const INITIAL_STATE = {
  generatingNow: null,
  generatingNowLoading: false,
  generatingNowError: null,

  today: null,
  todayLoading: false,
  todayError: null,

  thisMonth: null,
  thisMonthLoading: false,
  thisMonthError: null,

  lifetime: null,
  lifetimeLoading: false,
  lifetimeError: null,

  statusCounts: null,
  statusCountsLoading: false,
  statusCountsError: null,

  branches: [],
  branchesCount: 0,
  branchesPage: 1,
  branchesPageSize: 50,
  branchesLoading: false,
  branchesError: null,

  trendByBranch: {},
  trendLoading: false,
  trendError: null,

  toggleFavouriteLoading: false,
  toggleFavouriteError: null,

  alarms: [],
  alarmsCount: 0,
  alarmsLoading: false,
  alarmsError: null,

  ackAlarmLoading: false,
  ackAlarmError: null,

  forceLoginLoading: false,
  forceLoginError: null,
  forceLoginData: null,
};

const clientSolarReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case clientSolarTypes.FETCH_CS_GENERATING_NOW_LOADING:
      return { ...state, generatingNowLoading: action.payload };
    case clientSolarTypes.FETCH_CS_GENERATING_NOW_SUCCESS:
      return { ...state, generatingNow: action.payload, generatingNowError: null };
    case clientSolarTypes.FETCH_CS_GENERATING_NOW_FAILURE:
      return { ...state, generatingNowError: action.payload };

    case clientSolarTypes.FETCH_CS_TODAY_LOADING:
      return { ...state, todayLoading: action.payload };
    case clientSolarTypes.FETCH_CS_TODAY_SUCCESS:
      return { ...state, today: action.payload, todayError: null };
    case clientSolarTypes.FETCH_CS_TODAY_FAILURE:
      return { ...state, todayError: action.payload };

    case clientSolarTypes.FETCH_CS_THIS_MONTH_LOADING:
      return { ...state, thisMonthLoading: action.payload };
    case clientSolarTypes.FETCH_CS_THIS_MONTH_SUCCESS:
      return { ...state, thisMonth: action.payload, thisMonthError: null };
    case clientSolarTypes.FETCH_CS_THIS_MONTH_FAILURE:
      return { ...state, thisMonthError: action.payload };

    case clientSolarTypes.FETCH_CS_LIFETIME_LOADING:
      return { ...state, lifetimeLoading: action.payload };
    case clientSolarTypes.FETCH_CS_LIFETIME_SUCCESS:
      return { ...state, lifetime: action.payload, lifetimeError: null };
    case clientSolarTypes.FETCH_CS_LIFETIME_FAILURE:
      return { ...state, lifetimeError: action.payload };

    case clientSolarTypes.FETCH_CS_STATUS_COUNTS_LOADING:
      return { ...state, statusCountsLoading: action.payload };
    case clientSolarTypes.FETCH_CS_STATUS_COUNTS_SUCCESS:
      return { ...state, statusCounts: action.payload, statusCountsError: null };
    case clientSolarTypes.FETCH_CS_STATUS_COUNTS_FAILURE:
      return { ...state, statusCountsError: action.payload };

    case clientSolarTypes.FETCH_CS_BRANCHES_LOADING:
      return { ...state, branchesLoading: action.payload };
    case clientSolarTypes.FETCH_CS_BRANCHES_SUCCESS:
      return {
        ...state,
        branches: action.payload.results,
        branchesCount: action.payload.count,
        branchesPage: action.payload.page,
        branchesPageSize: action.payload.page_size,
        branchesError: null,
      };
    case clientSolarTypes.FETCH_CS_BRANCHES_FAILURE:
      return { ...state, branchesError: action.payload };

    case clientSolarTypes.FETCH_CS_BRANCH_TREND_LOADING:
      return { ...state, trendLoading: action.payload };
    case clientSolarTypes.FETCH_CS_BRANCH_TREND_SUCCESS: {
      const { branchId, points = [], hours, branch_id: serverBranchId } = action.payload || {};
      const key = branchId ?? serverBranchId;
      return {
        ...state,
        trendByBranch: { ...state.trendByBranch, [key]: { points, hours } },
        trendError: null,
      };
    }
    case clientSolarTypes.FETCH_CS_BRANCH_TREND_FAILURE:
      return { ...state, trendError: action.payload };

    case clientSolarTypes.TOGGLE_CS_FAVOURITE_LOADING:
      return { ...state, toggleFavouriteLoading: action.payload };
    case clientSolarTypes.TOGGLE_CS_FAVOURITE_SUCCESS: {
      const { branchId, is_favourited } = action.payload || {};
      return {
        ...state,
        branches: state.branches.map((b) =>
          b?.id === branchId ? { ...b, is_favourited } : b
        ),
        toggleFavouriteError: null,
      };
    }
    case clientSolarTypes.TOGGLE_CS_FAVOURITE_FAILURE:
      return { ...state, toggleFavouriteError: action.payload };

    case clientSolarTypes.FETCH_CS_ALARMS_LOADING:
      return { ...state, alarmsLoading: action.payload };
    case clientSolarTypes.FETCH_CS_ALARMS_SUCCESS:
      return {
        ...state,
        alarms: action.payload.results,
        alarmsCount: action.payload.count,
        alarmsError: null,
      };
    case clientSolarTypes.FETCH_CS_ALARMS_FAILURE:
      return { ...state, alarmsError: action.payload };

    case clientSolarTypes.ACK_CS_ALARM_LOADING:
      return { ...state, ackAlarmLoading: action.payload };
    case clientSolarTypes.ACK_CS_ALARM_SUCCESS: {
      const { alarmId, is_acknowledged, acked_at, ack_note } = action.payload || {};
      return {
        ...state,
        alarms: state.alarms.map((a) =>
          a?.id === alarmId ? { ...a, is_acknowledged, acked_at, ack_note } : a
        ),
        ackAlarmError: null,
      };
    }
    case clientSolarTypes.ACK_CS_ALARM_FAILURE:
      return { ...state, ackAlarmError: action.payload };

    case clientSolarTypes.CS_FORCE_LOGIN_LOADING:
      return { ...state, forceLoginLoading: action.payload };
    case clientSolarTypes.CS_FORCE_LOGIN_SUCCESS:
      return { ...state, forceLoginData: action.payload, forceLoginError: null };
    case clientSolarTypes.CS_FORCE_LOGIN_FAILURE:
      return { ...state, forceLoginError: action.payload };

    default:
      return state;
  }
};

export default clientSolarReducer;
