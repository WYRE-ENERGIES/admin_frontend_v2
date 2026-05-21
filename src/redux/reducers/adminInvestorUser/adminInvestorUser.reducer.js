import adminInvestorUserTypes from "./adminInvestorUser.type";

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

const adminInvestorUserReducer = (state = initialState, action) => {
  switch (action.type) {
    case adminInvestorUserTypes.GET_ADMIN_INVESTOR_USERS_LOADING:
      return { ...state, listLoading: action.payload };
    case adminInvestorUserTypes.GET_ADMIN_INVESTOR_USERS_SUCCESS:
      return { ...state, list: action.payload };

    case adminInvestorUserTypes.CREATE_ADMIN_INVESTOR_USER_LOADING:
      return { ...state, createLoading: action.payload };
    case adminInvestorUserTypes.CREATE_ADMIN_INVESTOR_USER_SUCCESS:
      return { ...state, lastCreated: action.payload };

    case adminInvestorUserTypes.GET_ADMIN_INVESTOR_USER_DETAIL_LOADING:
      return { ...state, detailLoading: action.payload };
    case adminInvestorUserTypes.GET_ADMIN_INVESTOR_USER_DETAIL_SUCCESS:
      return { ...state, detail: action.payload };
    case adminInvestorUserTypes.CLEAR_ADMIN_INVESTOR_USER_DETAIL:
      return { ...state, detail: null };

    case adminInvestorUserTypes.DELETE_ADMIN_INVESTOR_USER_LOADING:
      return { ...state, deleteLoading: action.payload };
    case adminInvestorUserTypes.DELETE_ADMIN_INVESTOR_USER_SUCCESS:
      return { ...state, lastDeleted: action.payload };

    default:
      return state;
  }
};

export default adminInvestorUserReducer;
