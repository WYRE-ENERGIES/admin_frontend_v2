import { APIService } from "../../../config/Api/apiServices";
import {
  setSystemConstantsLoading,
  setSystemConstantsSuccess,
  setSystemConstantsError,
  setSystemConstantsListSuccess,
  setSystemTariffSuccess,
  setSystemConstantsBulkUpdateLoading,
  setSystemConstantsBulkUpdateSuccess,
  setSystemConstantsBulkUpdateError,
  setSystemConstantUpdateLoading,
  setSystemConstantUpdateSuccess,
  setSystemConstantUpdateError,
} from "./system.constants.creator";

export const fetchSystemConstantsAll = () => async (dispatch) => {
  dispatch(setSystemConstantsLoading(true));
  try {
    const [valuesRes, listRes, tariffRes] = await Promise.all([
      APIService.get('/api/v1/system-constants-values/'),
      APIService.get('/api/v1/system-constants/'),
      APIService.get('/api/v1/tariff-structure/'),
    ]);
    dispatch(setSystemConstantsSuccess(valuesRes.data?.data || {}));
    dispatch(setSystemConstantsListSuccess(listRes.data?.data || []));
    dispatch(setSystemTariffSuccess(tariffRes.data?.data || {}));
    dispatch(setSystemConstantsLoading(false));
    return { fulfilled: true };
  } catch (error) {
    dispatch(setSystemConstantsLoading(false));
    dispatch(setSystemConstantsError(error?.response?.data || { detail: 'Failed to load system constants' }));
    return { fulfilled: false, message: error?.response?.data?.detail };
  }
};

export const bulkUpdateSystemConstants = (constantsPayload) => async (dispatch) => {
  dispatch(setSystemConstantsBulkUpdateLoading(true));
  try {
    const res = await APIService.post('/api/v1/system-constants-bulk-update/', constantsPayload);
    dispatch(setSystemConstantsBulkUpdateSuccess(res.data));
    // refresh values
    const valuesRes = await APIService.get('/api/v1/system-constants-values/');
    dispatch(setSystemConstantsSuccess(valuesRes.data?.data || {}));
    dispatch(setSystemConstantsBulkUpdateLoading(false));
    return { fulfilled: true };
  } catch (error) {
    dispatch(setSystemConstantsBulkUpdateLoading(false));
    dispatch(setSystemConstantsBulkUpdateError(error?.response?.data || { detail: 'Bulk update failed' }));
    return { fulfilled: false, message: error?.response?.data?.detail };
  }
};

export const updateSystemConstantById = (id, payload) => async (dispatch) => {
  dispatch(setSystemConstantUpdateLoading(true));
  try {
    const res = await APIService.put(`/api/v1/system-constants/${id}/`, payload);
    dispatch(setSystemConstantUpdateSuccess(res.data));
    // refresh values
    const valuesRes = await APIService.get('/api/v1/system-constants-values/');
    dispatch(setSystemConstantsSuccess(valuesRes.data?.data || {}));
    dispatch(setSystemConstantUpdateLoading(false));
    return { fulfilled: true };
  } catch (error) {
    dispatch(setSystemConstantUpdateLoading(false));
    dispatch(setSystemConstantUpdateError(error?.response?.data || { detail: 'Update failed' }));
    return { fulfilled: false, message: error?.response?.data?.detail };
  }
};


