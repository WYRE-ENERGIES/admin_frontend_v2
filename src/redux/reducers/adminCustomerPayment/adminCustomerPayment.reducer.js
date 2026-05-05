import adminCustomerPaymentTypes from "./adminCustomerPayment.type";

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

const adminCustomerPaymentReducer = (state = initialState, action) => {
  switch (action.type) {
    case adminCustomerPaymentTypes.GET_ADMIN_CUSTOMER_PAYMENTS_LOADING:
      return { ...state, listLoading: action.payload };
    case adminCustomerPaymentTypes.GET_ADMIN_CUSTOMER_PAYMENTS_SUCCESS:
      return { ...state, list: action.payload };

    case adminCustomerPaymentTypes.CREATE_ADMIN_CUSTOMER_PAYMENT_LOADING:
      return { ...state, createLoading: action.payload };
    case adminCustomerPaymentTypes.CREATE_ADMIN_CUSTOMER_PAYMENT_SUCCESS:
      return { ...state, lastCreated: action.payload };

    case adminCustomerPaymentTypes.GET_ADMIN_CUSTOMER_PAYMENT_DETAIL_LOADING:
      return { ...state, detailLoading: action.payload };
    case adminCustomerPaymentTypes.GET_ADMIN_CUSTOMER_PAYMENT_DETAIL_SUCCESS:
      return { ...state, detail: action.payload };
    case adminCustomerPaymentTypes.CLEAR_ADMIN_CUSTOMER_PAYMENT_DETAIL:
      return { ...state, detail: null };

    case adminCustomerPaymentTypes.DELETE_ADMIN_CUSTOMER_PAYMENT_LOADING:
      return { ...state, deleteLoading: action.payload };
    case adminCustomerPaymentTypes.DELETE_ADMIN_CUSTOMER_PAYMENT_SUCCESS:
      return { ...state, lastDeleted: action.payload };

    default:
      return state;
  }
};

export default adminCustomerPaymentReducer;
