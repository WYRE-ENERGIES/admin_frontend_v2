import adminInvestorOverviewTypes from "./adminInvestorOverview.type";

const initialState = {
  loading: false,
  totalInvested: null,
  customersExpected: null,
  activeProjects: null,
  activeInvestors: null,
  nearestPayments: null,
};

const adminInvestorOverviewReducer = (state = initialState, action) => {
  switch (action.type) {
    case adminInvestorOverviewTypes.GET_ADMIN_INVESTOR_OVERVIEW_LOADING:
      return { ...state, loading: action.payload };
    case adminInvestorOverviewTypes.GET_ADMIN_INVESTOR_OVERVIEW_SUCCESS:
      return {
        ...state,
        loading: false,
        totalInvested: action.payload.totalInvested ?? null,
        customersExpected: action.payload.customersExpected ?? null,
        activeProjects: action.payload.activeProjects ?? null,
        activeInvestors: action.payload.activeInvestors ?? null,
        nearestPayments: action.payload.nearestPayments ?? null,
      };
    default:
      return state;
  }
};

export default adminInvestorOverviewReducer;
