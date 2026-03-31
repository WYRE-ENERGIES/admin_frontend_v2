import installChecklistTypes from './installChecklist.type';

const INITIAL_STATE = {
  approvedInstallations: [],
  approvedInstallationsLoading: false,
  approvedInstallationsError: null,

  installationDetails: null,
  installationDetailsLoading: false,
  installationDetailsError: null,
};

const installChecklistReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case installChecklistTypes.FETCH_APPROVED_INSTALLATIONS_LOADING:
      return {
        ...state,
        approvedInstallationsLoading: action.payload,
      };
    case installChecklistTypes.FETCH_APPROVED_INSTALLATIONS_SUCCESS:
      return {
        ...state,
        approvedInstallations: action.payload,
        approvedInstallationsError: null,
      };
    case installChecklistTypes.FETCH_APPROVED_INSTALLATIONS_FAILURE:
      return {
        ...state,
        approvedInstallationsError: action.payload,
      };

    case installChecklistTypes.FETCH_INSTALLATION_DETAILS_LOADING:
      return {
        ...state,
        installationDetailsLoading: action.payload,
      };
    case installChecklistTypes.FETCH_INSTALLATION_DETAILS_SUCCESS:
      return {
        ...state,
        installationDetails: action.payload,
        installationDetailsError: null,
      };
    case installChecklistTypes.FETCH_INSTALLATION_DETAILS_FAILURE:
      return {
        ...state,
        installationDetailsError: action.payload,
      };
    case installChecklistTypes.CLEAR_INSTALLATION_DETAILS:
      return {
        ...state,
        installationDetails: null,
        installationDetailsError: null,
      };

    default:
      return state;
  }
};

export default installChecklistReducer;
