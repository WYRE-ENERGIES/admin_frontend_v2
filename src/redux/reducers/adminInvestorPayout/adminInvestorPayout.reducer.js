import adminInvestorPayoutTypes from "./adminInvestorPayout.type";

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

const adminInvestorPayoutReducer = (state = initialState, action) => {
  switch (action.type) {
    case adminInvestorPayoutTypes.GET_ADMIN_INVESTOR_PAYOUTS_LOADING:
      return { ...state, listLoading: action.payload };
    case adminInvestorPayoutTypes.GET_ADMIN_INVESTOR_PAYOUTS_SUCCESS:
      return { ...state, list: action.payload };

    case adminInvestorPayoutTypes.CREATE_ADMIN_INVESTOR_PAYOUT_LOADING:
      return { ...state, createLoading: action.payload };
    case adminInvestorPayoutTypes.CREATE_ADMIN_INVESTOR_PAYOUT_SUCCESS:
      return { ...state, lastCreated: action.payload };

    case adminInvestorPayoutTypes.GET_ADMIN_INVESTOR_PAYOUT_DETAIL_LOADING:
      return { ...state, detailLoading: action.payload };
    case adminInvestorPayoutTypes.GET_ADMIN_INVESTOR_PAYOUT_DETAIL_SUCCESS:
      return { ...state, detail: action.payload };
    case adminInvestorPayoutTypes.CLEAR_ADMIN_INVESTOR_PAYOUT_DETAIL:
      return { ...state, detail: null };

    case adminInvestorPayoutTypes.DELETE_ADMIN_INVESTOR_PAYOUT_LOADING:
      return { ...state, deleteLoading: action.payload };
    case adminInvestorPayoutTypes.DELETE_ADMIN_INVESTOR_PAYOUT_SUCCESS:
      return { ...state, lastDeleted: action.payload };

    default:
      return state;
  }
};

export default adminInvestorPayoutReducer;
