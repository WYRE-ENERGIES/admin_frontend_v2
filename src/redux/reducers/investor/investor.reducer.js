import investorTypes from "./investor.type";

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
      primaryReceivables: null,
      portfolioScore: null,
      portfolioGeneration: null,
      repaymentTotals: null,
      co2: null,
      totalDeposited: null,
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
  supportTickets: {
    list: [],
    listLoading: false,
    listError: null,
    detail: null,
    detailLoading: false,
    createLoading: false,
  },
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
          kpis: {
            ...action.payload.kpis,
            totalDeposited: state.portfolioOverview.kpis.totalDeposited,
          },
        },
      };
    case investorTypes.INVESTOR_TOTAL_DEPOSITED_SUCCESS:
      return {
        ...state,
        portfolioOverview: {
          ...state.portfolioOverview,
          kpis: {
            ...state.portfolioOverview.kpis,
            totalDeposited: action.payload,
          },
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
    case investorTypes.INVESTOR_SUPPORT_TICKETS_LOADING:
      return {
        ...state,
        supportTickets: {
          ...state.supportTickets,
          listLoading: action.payload,
          ...(action.payload ? { listError: null } : {}),
        },
      };
    case investorTypes.INVESTOR_SUPPORT_TICKETS_SUCCESS:
      return {
        ...state,
        supportTickets: {
          ...state.supportTickets,
          list: action.payload,
          listLoading: false,
          listError: null,
        },
      };
    case investorTypes.INVESTOR_SUPPORT_TICKETS_FAIL:
      return {
        ...state,
        supportTickets: {
          ...state.supportTickets,
          listLoading: false,
          listError: action.payload,
        },
      };
    case investorTypes.INVESTOR_SUPPORT_TICKET_DETAIL_LOADING:
      return {
        ...state,
        supportTickets: {
          ...state.supportTickets,
          detailLoading: action.payload,
        },
      };
    case investorTypes.INVESTOR_SUPPORT_TICKET_DETAIL_SUCCESS:
      return {
        ...state,
        supportTickets: {
          ...state.supportTickets,
          detail: action.payload,
        },
      };
    case investorTypes.INVESTOR_SUPPORT_TICKET_DETAIL_CLEAR:
      return {
        ...state,
        supportTickets: {
          ...state.supportTickets,
          detail: null,
        },
      };
    case investorTypes.INVESTOR_SUPPORT_TICKET_CREATE_LOADING:
      return {
        ...state,
        supportTickets: {
          ...state.supportTickets,
          createLoading: action.payload,
        },
      };
    default:
      return state;
  }
};

export default investorReducer;
