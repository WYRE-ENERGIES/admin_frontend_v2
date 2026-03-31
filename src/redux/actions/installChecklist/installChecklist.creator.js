import installChecklistTypes from '../../reducers/installChecklist/installChecklist.type';

export const fetchApprovedInstallationsLoading = (payload = true) => ({
  type: installChecklistTypes.FETCH_APPROVED_INSTALLATIONS_LOADING,
  payload,
});

export const fetchApprovedInstallationsSuccess = (payload = []) => ({
  type: installChecklistTypes.FETCH_APPROVED_INSTALLATIONS_SUCCESS,
  payload,
});

export const fetchApprovedInstallationsFailure = (payload) => ({
  type: installChecklistTypes.FETCH_APPROVED_INSTALLATIONS_FAILURE,
  payload,
});

export const fetchInstallationDetailsLoading = (payload = true) => ({
  type: installChecklistTypes.FETCH_INSTALLATION_DETAILS_LOADING,
  payload,
});

export const fetchInstallationDetailsSuccess = (payload) => ({
  type: installChecklistTypes.FETCH_INSTALLATION_DETAILS_SUCCESS,
  payload,
});

export const fetchInstallationDetailsFailure = (payload) => ({
  type: installChecklistTypes.FETCH_INSTALLATION_DETAILS_FAILURE,
  payload,
});

export const clearInstallationDetails = () => ({
  type: installChecklistTypes.CLEAR_INSTALLATION_DETAILS,
});
