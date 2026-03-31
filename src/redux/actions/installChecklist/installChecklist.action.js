import { APIService } from '../../../config/Api/apiServices';
import {
  fetchApprovedInstallationsLoading,
  fetchApprovedInstallationsSuccess,
  fetchApprovedInstallationsFailure,
  fetchInstallationDetailsLoading,
  fetchInstallationDetailsSuccess,
  fetchInstallationDetailsFailure,
  clearInstallationDetails as clearInstallationDetailsAction,
} from './installChecklist.creator';

const extractErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.detail ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

export const fetchApprovedInstallations = () => async (dispatch) => {
  dispatch(fetchApprovedInstallationsLoading(true));
  try {
    const response = await APIService.get('/api/v1/install-checklist/approved/');
    const data = response?.data?.data ?? [];
    dispatch(fetchApprovedInstallationsSuccess(data));
    return { fulfilled: true, data };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not load approved installations.');
    dispatch(fetchApprovedInstallationsFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(fetchApprovedInstallationsLoading(false));
  }
};

export const fetchInstallationDetails = (id) => async (dispatch) => {
  dispatch(fetchInstallationDetailsLoading(true));
  try {
    const response = await APIService.get(`/api/v1/install-checklist/${id}/`);
    const data = response?.data?.data ?? null;
    dispatch(fetchInstallationDetailsSuccess(data));
    return { fulfilled: true, data };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not load installation details.');
    dispatch(fetchInstallationDetailsFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(fetchInstallationDetailsLoading(false));
  }
};

export const clearInstallationDetails = () => (dispatch) => {
  dispatch(clearInstallationDetailsAction());
};
