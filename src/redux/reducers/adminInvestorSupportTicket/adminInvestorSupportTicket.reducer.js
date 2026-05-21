import adminInvestorSupportTicketTypes from "./adminInvestorSupportTicket.type";

const initialState = {
  listLoading: false,
  list: null,
  detailLoading: false,
  detail: null,
  createResponseLoading: false,
};

const adminInvestorSupportTicketReducer = (state = initialState, action) => {
  switch (action.type) {
    case adminInvestorSupportTicketTypes.GET_ADMIN_SUPPORT_TICKETS_LOADING:
      return { ...state, listLoading: action.payload };
    case adminInvestorSupportTicketTypes.GET_ADMIN_SUPPORT_TICKETS_SUCCESS:
      return { ...state, list: action.payload };

    case adminInvestorSupportTicketTypes.GET_ADMIN_SUPPORT_TICKET_DETAIL_LOADING:
      return { ...state, detailLoading: action.payload };
    case adminInvestorSupportTicketTypes.GET_ADMIN_SUPPORT_TICKET_DETAIL_SUCCESS:
      return { ...state, detail: action.payload };
    case adminInvestorSupportTicketTypes.CLEAR_ADMIN_SUPPORT_TICKET_DETAIL:
      return { ...state, detail: null };

    case adminInvestorSupportTicketTypes.CREATE_ADMIN_SUPPORT_TICKET_RESPONSE_LOADING:
      return { ...state, createResponseLoading: action.payload };

    default:
      return state;
  }
};

export default adminInvestorSupportTicketReducer;
