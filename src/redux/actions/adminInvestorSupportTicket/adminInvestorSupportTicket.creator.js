import adminInvestorSupportTicketTypes from "../../reducers/adminInvestorSupportTicket/adminInvestorSupportTicket.type";

export const getAdminSupportTicketsLoading = (payload = true) => ({
  type: adminInvestorSupportTicketTypes.GET_ADMIN_SUPPORT_TICKETS_LOADING,
  payload,
});

export const getAdminSupportTicketsSuccess = (payload) => ({
  type: adminInvestorSupportTicketTypes.GET_ADMIN_SUPPORT_TICKETS_SUCCESS,
  payload,
});

export const getAdminSupportTicketDetailLoading = (payload = true) => ({
  type: adminInvestorSupportTicketTypes.GET_ADMIN_SUPPORT_TICKET_DETAIL_LOADING,
  payload,
});

export const getAdminSupportTicketDetailSuccess = (payload) => ({
  type: adminInvestorSupportTicketTypes.GET_ADMIN_SUPPORT_TICKET_DETAIL_SUCCESS,
  payload,
});

export const clearAdminSupportTicketDetail = () => ({
  type: adminInvestorSupportTicketTypes.CLEAR_ADMIN_SUPPORT_TICKET_DETAIL,
});

export const createAdminSupportTicketResponseLoading = (payload = true) => ({
  type: adminInvestorSupportTicketTypes.CREATE_ADMIN_SUPPORT_TICKET_RESPONSE_LOADING,
  payload,
});
