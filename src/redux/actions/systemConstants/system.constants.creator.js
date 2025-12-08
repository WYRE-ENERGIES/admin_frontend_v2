export const SYSTEM_CONSTANTS_LOADING = 'SYSTEM_CONSTANTS_LOADING';
export const SYSTEM_CONSTANTS_SUCCESS = 'SYSTEM_CONSTANTS_SUCCESS';
export const SYSTEM_CONSTANTS_ERROR = 'SYSTEM_CONSTANTS_ERROR';

export const SYSTEM_CONSTANTS_LIST_SUCCESS = 'SYSTEM_CONSTANTS_LIST_SUCCESS';
export const SYSTEM_TARIFF_SUCCESS = 'SYSTEM_TARIFF_SUCCESS';

export const SYSTEM_CONSTANTS_BULK_UPDATE_LOADING = 'SYSTEM_CONSTANTS_BULK_UPDATE_LOADING';
export const SYSTEM_CONSTANTS_BULK_UPDATE_SUCCESS = 'SYSTEM_CONSTANTS_BULK_UPDATE_SUCCESS';
export const SYSTEM_CONSTANTS_BULK_UPDATE_ERROR = 'SYSTEM_CONSTANTS_BULK_UPDATE_ERROR';

export const SYSTEM_CONSTANT_UPDATE_LOADING = 'SYSTEM_CONSTANT_UPDATE_LOADING';
export const SYSTEM_CONSTANT_UPDATE_SUCCESS = 'SYSTEM_CONSTANT_UPDATE_SUCCESS';
export const SYSTEM_CONSTANT_UPDATE_ERROR = 'SYSTEM_CONSTANT_UPDATE_ERROR';

export const setSystemConstantsLoading = (payload) => ({ type: SYSTEM_CONSTANTS_LOADING, payload });
export const setSystemConstantsSuccess = (payload) => ({ type: SYSTEM_CONSTANTS_SUCCESS, payload });
export const setSystemConstantsError = (payload) => ({ type: SYSTEM_CONSTANTS_ERROR, payload });

export const setSystemConstantsListSuccess = (payload) => ({ type: SYSTEM_CONSTANTS_LIST_SUCCESS, payload });
export const setSystemTariffSuccess = (payload) => ({ type: SYSTEM_TARIFF_SUCCESS, payload });

export const setSystemConstantsBulkUpdateLoading = (payload) => ({ type: SYSTEM_CONSTANTS_BULK_UPDATE_LOADING, payload });
export const setSystemConstantsBulkUpdateSuccess = (payload) => ({ type: SYSTEM_CONSTANTS_BULK_UPDATE_SUCCESS, payload });
export const setSystemConstantsBulkUpdateError = (payload) => ({ type: SYSTEM_CONSTANTS_BULK_UPDATE_ERROR, payload });

export const setSystemConstantUpdateLoading = (payload) => ({ type: SYSTEM_CONSTANT_UPDATE_LOADING, payload });
export const setSystemConstantUpdateSuccess = (payload) => ({ type: SYSTEM_CONSTANT_UPDATE_SUCCESS, payload });
export const setSystemConstantUpdateError = (payload) => ({ type: SYSTEM_CONSTANT_UPDATE_ERROR, payload });


