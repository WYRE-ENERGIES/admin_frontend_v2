import adminInvestorProjectTypes from "./adminInvestorProject.type";

const initialState = {
  listLoading: false,
  list: null,
  performanceLoading: false,
  performance: null,
  createLoading: false,
  lastCreated: null,
  detailLoading: false,
  detail: null,
  deleteLoading: false,
  lastDeleted: null,
};

const adminInvestorProjectReducer = (state = initialState, action) => {
  switch (action.type) {
    case adminInvestorProjectTypes.GET_ADMIN_INVESTOR_PROJECTS_LOADING:
      return { ...state, listLoading: action.payload };
    case adminInvestorProjectTypes.GET_ADMIN_INVESTOR_PROJECTS_SUCCESS:
      return { ...state, list: action.payload };

    case adminInvestorProjectTypes.GET_ADMIN_PROJECTS_PERFORMANCE_LOADING:
      return { ...state, performanceLoading: action.payload };
    case adminInvestorProjectTypes.GET_ADMIN_PROJECTS_PERFORMANCE_SUCCESS:
      return { ...state, performance: action.payload };

    case adminInvestorProjectTypes.CREATE_ADMIN_INVESTOR_PROJECT_LOADING:
      return { ...state, createLoading: action.payload };
    case adminInvestorProjectTypes.CREATE_ADMIN_INVESTOR_PROJECT_SUCCESS:
      return { ...state, lastCreated: action.payload };

    case adminInvestorProjectTypes.GET_ADMIN_INVESTOR_PROJECT_DETAIL_LOADING:
      return { ...state, detailLoading: action.payload };
    case adminInvestorProjectTypes.GET_ADMIN_INVESTOR_PROJECT_DETAIL_SUCCESS:
      return { ...state, detail: action.payload };
    case adminInvestorProjectTypes.CLEAR_ADMIN_INVESTOR_PROJECT_DETAIL:
      return { ...state, detail: null };

    case adminInvestorProjectTypes.DELETE_ADMIN_INVESTOR_PROJECT_LOADING:
      return { ...state, deleteLoading: action.payload };
    case adminInvestorProjectTypes.DELETE_ADMIN_INVESTOR_PROJECT_SUCCESS:
      return { ...state, lastDeleted: action.payload };

    default:
      return state;
  }
};

export default adminInvestorProjectReducer;
