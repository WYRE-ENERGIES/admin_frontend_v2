import investorTypes from "./investor.type";
import { MOCK_INVESTOR_ACCOUNT_KYC } from "./investor.initialData";

const EMPTY_PROJECTS_BUNDLE = {
  summary: {},
  projects: [],
  openProjects: [],
  investmentTickets: [],
};

const EMPTY_PAYMENTS_BUNDLE = {
  kpis: {},
  schedule: [],
  payoutHistory: [],
  receivableHealth: {},
  ledger: [],
  ledgerMeta: null,
  ledgerPeriodYear: null,
};

const initialState = {
  portfolioOverview: {
    loading: false,
    error: null,
    partialErrors: null,
    alert: null,
    kpis: {
      primaryInvested: null,
      repaymentScore: null,
      portfolioGeneration: null,
      repaymentTotals: null,
      co2: null,
    },
    financedProjects: [],
    chartData: [],
    activity: [],
  },
  projectsLoading: false,
  projects: EMPTY_PROJECTS_BUNDLE,
  projectsError: null,
  paymentsLoading: false,
  payments: EMPTY_PAYMENTS_BUNDLE,
  paymentsPartialErrors: null,
  accountKycLoading: false,
  accountKyc: MOCK_INVESTOR_ACCOUNT_KYC,
};

const investorReducer = (state = initialState, action) => {
  switch (action.type) {
    case investorTypes.INVESTOR_PORTFOLIO_OVERVIEW_LOADING:
      return {
        ...state,
        portfolioOverview: {
          ...state.portfolioOverview,
          loading: action.payload,
          ...(action.payload ? { error: null } : {}),
        },
      };
    case investorTypes.INVESTOR_PORTFOLIO_OVERVIEW_SUCCESS:
      return {
        ...state,
        portfolioOverview: {
          ...state.portfolioOverview,
          loading: false,
          error: null,
          ...action.payload,
        },
      };
    case investorTypes.INVESTOR_PORTFOLIO_OVERVIEW_FAIL:
      return {
        ...state,
        portfolioOverview: {
          ...state.portfolioOverview,
          loading: false,
          error: action.payload,
        },
      };
    case investorTypes.INVESTOR_PROJECTS_LOADING:
      return {
        ...state,
        projectsLoading: action.payload,
        ...(action.payload ? { projectsError: null } : {}),
      };
    case investorTypes.INVESTOR_PROJECTS_SUCCESS:
      return {
        ...state,
        projects: action.payload,
        projectsError: null,
        projectsPartialErrors: action.payload?.partialErrors ?? null,
      };
    case investorTypes.INVESTOR_PAYMENTS_LOADING:
      return {
        ...state,
        paymentsLoading: action.payload,
        ...(action.payload ? { paymentsPartialErrors: null } : {}),
      };
    case investorTypes.INVESTOR_PAYMENTS_SUCCESS:
      return {
        ...state,
        payments: action.payload,
        paymentsPartialErrors: action.payload?.partialErrors ?? null,
      };
    case investorTypes.INVESTOR_ACCOUNT_KYC_LOADING:
      return { ...state, accountKycLoading: action.payload };
    case investorTypes.INVESTOR_ACCOUNT_KYC_SUCCESS:
      return { ...state, accountKyc: action.payload };
    default:
      return state;
  }
};

export default investorReducer;
