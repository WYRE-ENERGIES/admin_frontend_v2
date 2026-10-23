import adminInvestorDirectoryTypes from "./adminInvestorDirectory.type";

const initialState = {
  financeByInvestorLoading: false,
  financeByInvestor: null,
};

const adminInvestorDirectoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case adminInvestorDirectoryTypes.GET_ADMIN_FINANCE_BY_INVESTOR_LOADING:
      return { ...state, financeByInvestorLoading: action.payload };
    case adminInvestorDirectoryTypes.GET_ADMIN_FINANCE_BY_INVESTOR_SUCCESS:
      return { ...state, financeByInvestor: action.payload };
    default:
      return state;
  }
};

export default adminInvestorDirectoryReducer;

