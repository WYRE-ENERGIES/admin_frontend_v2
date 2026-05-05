import adminInvestorInvestmentTypes from "./adminInvestorInvestment.type";

const initialState = {
  listLoading: false,
  list: null,
  createLoading: false,
  lastCreated: null,
  detailLoading: false,
  detail: null,
  deleteLoading: false,
  lastDeleted: null,
};

const adminInvestorInvestmentReducer = (state = initialState, action) => {
  switch (action.type) {
    case adminInvestorInvestmentTypes.GET_ADMIN_INVESTOR_INVESTMENTS_LOADING:
      return { ...state, listLoading: action.payload };
    case adminInvestorInvestmentTypes.GET_ADMIN_INVESTOR_INVESTMENTS_SUCCESS:
      return { ...state, list: action.payload };

    case adminInvestorInvestmentTypes.CREATE_ADMIN_INVESTOR_INVESTMENT_LOADING:
      return { ...state, createLoading: action.payload };
    case adminInvestorInvestmentTypes.CREATE_ADMIN_INVESTOR_INVESTMENT_SUCCESS:
      return { ...state, lastCreated: action.payload };

    case adminInvestorInvestmentTypes.GET_ADMIN_INVESTOR_INVESTMENT_DETAIL_LOADING:
      return { ...state, detailLoading: action.payload };
    case adminInvestorInvestmentTypes.GET_ADMIN_INVESTOR_INVESTMENT_DETAIL_SUCCESS:
      return { ...state, detail: action.payload };
    case adminInvestorInvestmentTypes.CLEAR_ADMIN_INVESTOR_INVESTMENT_DETAIL:
      return { ...state, detail: null };

    case adminInvestorInvestmentTypes.DELETE_ADMIN_INVESTOR_INVESTMENT_LOADING:
      return { ...state, deleteLoading: action.payload };
    case adminInvestorInvestmentTypes.DELETE_ADMIN_INVESTOR_INVESTMENT_SUCCESS:
      return { ...state, lastDeleted: action.payload };

    default:
      return state;
  }
};

export default adminInvestorInvestmentReducer;
