import {
  SYSTEM_CONSTANTS_LOADING,
  SYSTEM_CONSTANTS_SUCCESS,
  SYSTEM_CONSTANTS_ERROR,
  SYSTEM_CONSTANTS_LIST_SUCCESS,
  SYSTEM_TARIFF_SUCCESS,
  SYSTEM_CONSTANTS_BULK_UPDATE_LOADING,
  SYSTEM_CONSTANTS_BULK_UPDATE_SUCCESS,
  SYSTEM_CONSTANTS_BULK_UPDATE_ERROR,
  SYSTEM_CONSTANT_UPDATE_LOADING,
  SYSTEM_CONSTANT_UPDATE_SUCCESS,
  SYSTEM_CONSTANT_UPDATE_ERROR,
} from "../../actions/systemConstants/system.constants.creator";

const initialState = {
  loading: false,
  error: null,
  values: {},
  list: [],
  tariff: {},
  bulkUpdating: false,
  bulkUpdateError: null,
  lastBulkUpdate: null,
  updatingOne: false,
  updateOneError: null,
  lastUpdateOne: null,
};

export default function systemConstantsReducer(state = initialState, action) {
  switch (action.type) {
    case SYSTEM_CONSTANTS_LOADING:
      return { ...state, loading: action.payload };
    case SYSTEM_CONSTANTS_SUCCESS:
      return { ...state, values: action.payload };
    case SYSTEM_CONSTANTS_LIST_SUCCESS:
      return { ...state, list: action.payload };
    case SYSTEM_TARIFF_SUCCESS:
      return { ...state, tariff: action.payload };
    case SYSTEM_CONSTANTS_ERROR:
      return { ...state, error: action.payload };

    case SYSTEM_CONSTANTS_BULK_UPDATE_LOADING:
      return { ...state, bulkUpdating: action.payload };
    case SYSTEM_CONSTANTS_BULK_UPDATE_SUCCESS:
      return { ...state, lastBulkUpdate: action.payload, bulkUpdateError: null };
    case SYSTEM_CONSTANTS_BULK_UPDATE_ERROR:
      return { ...state, bulkUpdateError: action.payload };

    case SYSTEM_CONSTANT_UPDATE_LOADING:
      return { ...state, updatingOne: action.payload };
    case SYSTEM_CONSTANT_UPDATE_SUCCESS:
      return { ...state, lastUpdateOne: action.payload, updateOneError: null };
    case SYSTEM_CONSTANT_UPDATE_ERROR:
      return { ...state, updateOneError: action.payload };

    default:
      return state;
  }
}


