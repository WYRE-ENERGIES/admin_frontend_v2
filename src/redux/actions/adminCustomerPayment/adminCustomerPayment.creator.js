import adminCustomerPaymentTypes from "../../reducers/adminCustomerPayment/adminCustomerPayment.type";

export const getAdminCustomerPaymentsLoading = (payload = true) => ({
  type: adminCustomerPaymentTypes.GET_ADMIN_CUSTOMER_PAYMENTS_LOADING,
  payload,
});

export const getAdminCustomerPaymentsSuccess = (payload) => ({
  type: adminCustomerPaymentTypes.GET_ADMIN_CUSTOMER_PAYMENTS_SUCCESS,
  payload,
});

export const createAdminCustomerPaymentLoading = (payload = true) => ({
  type: adminCustomerPaymentTypes.CREATE_ADMIN_CUSTOMER_PAYMENT_LOADING,
  payload,
});

export const createAdminCustomerPaymentSuccess = (payload) => ({
  type: adminCustomerPaymentTypes.CREATE_ADMIN_CUSTOMER_PAYMENT_SUCCESS,
  payload,
});

export const getAdminCustomerPaymentDetailLoading = (payload = true) => ({
  type: adminCustomerPaymentTypes.GET_ADMIN_CUSTOMER_PAYMENT_DETAIL_LOADING,
  payload,
});

export const getAdminCustomerPaymentDetailSuccess = (payload) => ({
  type: adminCustomerPaymentTypes.GET_ADMIN_CUSTOMER_PAYMENT_DETAIL_SUCCESS,
  payload,
});

export const clearAdminCustomerPaymentDetail = () => ({
  type: adminCustomerPaymentTypes.CLEAR_ADMIN_CUSTOMER_PAYMENT_DETAIL,
});

export const deleteAdminCustomerPaymentLoading = (payload = true) => ({
  type: adminCustomerPaymentTypes.DELETE_ADMIN_CUSTOMER_PAYMENT_LOADING,
  payload,
});

export const deleteAdminCustomerPaymentSuccess = (payload) => ({
  type: adminCustomerPaymentTypes.DELETE_ADMIN_CUSTOMER_PAYMENT_SUCCESS,
  payload,
});

export const updateAdminCustomerPaymentLoading = (payload = true) => ({
  type: adminCustomerPaymentTypes.UPDATE_ADMIN_CUSTOMER_PAYMENT_LOADING,
  payload,
});

export const getAdminCustomerPaymentSchedulesLoading = (payload = true) => ({
  type: adminCustomerPaymentTypes.GET_ADMIN_CUSTOMER_PAYMENT_SCHEDULES_LOADING,
  payload,
});

export const getAdminCustomerPaymentSchedulesSuccess = (payload) => ({
  type: adminCustomerPaymentTypes.GET_ADMIN_CUSTOMER_PAYMENT_SCHEDULES_SUCCESS,
  payload,
});
