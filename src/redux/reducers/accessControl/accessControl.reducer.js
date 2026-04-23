import accessControlTypes from "./accessControl.type";
import { MOCK_ACCESS_CONTROL } from "./accessControl.initialData";

const initialState = {
  loading: false,
  error: null,
  data: MOCK_ACCESS_CONTROL,
};

const accessControlReducer = (state = initialState, action) => {
  switch (action.type) {
    case accessControlTypes.ACCESS_CONTROL_LOADING:
      return { ...state, loading: action.payload, ...(action.payload ? { error: null } : {}) };
    case accessControlTypes.ACCESS_CONTROL_SUCCESS:
      return { ...state, loading: false, error: null, data: action.payload };
    case accessControlTypes.ACCESS_CONTROL_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default accessControlReducer;

